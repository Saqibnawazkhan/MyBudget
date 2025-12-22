import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// GET all transactions with filters
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const categoryId = searchParams.get("categoryId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const search = searchParams.get("search");
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");
    const sortBy = searchParams.get("sortBy") || "date";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build where clause
    const where: {
      userId: string;
      type?: string;
      categoryId?: string | null;
      date?: { gte?: Date; lte?: Date };
      OR?: Array<{ description?: { contains: string }; notes?: { contains: string } }>;
    } = { userId: user.id };

    if (type) {
      where.type = type;
    }

    if (categoryId) {
      where.categoryId = categoryId === "uncategorized" ? null : categoryId;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    if (search) {
      where.OR = [
        { description: { contains: search } },
        { notes: { contains: search } },
      ];
    }

    // Build orderBy
    const orderBy: Record<string, string> = {};
    orderBy[sortBy] = sortOrder;

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: true,
      },
      orderBy,
      take: limit ? parseInt(limit) : undefined,
      skip: offset ? parseInt(offset) : undefined,
    });

    // Get total count for pagination
    const total = await prisma.transaction.count({ where });

    return NextResponse.json({
      success: true,
      data: transactions,
      meta: {
        total,
        limit: limit ? parseInt(limit) : transactions.length,
        offset: offset ? parseInt(offset) : 0,
      },
    });
  } catch (error) {
    console.error("Get transactions error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST create new transaction
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      amount,
      type,
      categoryId,
      date,
      description,
      paymentMethod,
      notes,
      tags,
      isRecurring,
    } = body;

    if (!amount || !type || !date) {
      return NextResponse.json(
        { success: false, error: "Amount, type, and date are required" },
        { status: 400 }
      );
    }

    if (type !== "income" && type !== "expense") {
      return NextResponse.json(
        { success: false, error: "Type must be 'income' or 'expense'" },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Amount must be positive" },
        { status: 400 }
      );
    }

    // Verify category exists and belongs to user (if provided)
    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          userId: user.id,
        },
      });

      if (!category) {
        return NextResponse.json(
          { success: false, error: "Category not found" },
          { status: 400 }
        );
      }
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        type,
        categoryId: categoryId || null,
        date: new Date(date),
        description: description || null,
        paymentMethod: paymentMethod || null,
        notes: notes || null,
        tags: tags || null,
        isRecurring: isRecurring || false,
        userId: user.id,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error("Create transaction error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
