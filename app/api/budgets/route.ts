import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getMonthRange } from "@/lib/utils";

// GET all budgets for a month
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
    const month = searchParams.get("month"); // Format: YYYY-MM

    const where: { userId: string; month?: string } = { userId: user.id };
    if (month) {
      where.month = month;
    }

    const budgets = await prisma.budget.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate spent amounts for each budget
    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
        const { start, end } = getMonthRange(budget.month);

        const whereClause: {
          userId: string;
          type: string;
          date: { gte: Date; lte: Date };
          categoryId?: string | null;
        } = {
          userId: user.id,
          type: "expense",
          date: {
            gte: start,
            lte: end,
          },
        };

        // If it's a category budget, filter by category
        if (budget.categoryId) {
          whereClause.categoryId = budget.categoryId;
        }

        const result = await prisma.transaction.aggregate({
          where: whereClause,
          _sum: {
            amount: true,
          },
        });

        const spent = result._sum.amount || 0;
        const remaining = budget.amount - spent;
        const percentUsed = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

        return {
          ...budget,
          spent,
          remaining,
          percentUsed: Math.round(percentUsed * 10) / 10,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: budgetsWithSpent,
    });
  } catch (error) {
    console.error("Get budgets error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST create new budget
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
    const { amount, month, categoryId } = body;

    if (!amount || !month) {
      return NextResponse.json(
        { success: false, error: "Amount and month are required" },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Amount must be positive" },
        { status: 400 }
      );
    }

    // Verify month format (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json(
        { success: false, error: "Month must be in YYYY-MM format" },
        { status: 400 }
      );
    }

    // Verify category exists and belongs to user (if provided)
    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          userId: user.id,
          type: "expense", // Budgets are only for expense categories
        },
      });

      if (!category) {
        return NextResponse.json(
          { success: false, error: "Category not found or not an expense category" },
          { status: 400 }
        );
      }
    }

    // Check if budget already exists for this month/category
    const existing = await prisma.budget.findFirst({
      where: {
        userId: user.id,
        month,
        categoryId: categoryId || null,
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Budget already exists for this month/category" },
        { status: 400 }
      );
    }

    const budget = await prisma.budget.create({
      data: {
        amount: parseFloat(amount),
        month,
        categoryId: categoryId || null,
        userId: user.id,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: budget,
    });
  } catch (error) {
    console.error("Create budget error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
