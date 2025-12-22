import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// GET single transaction
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        category: true,
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error("Get transaction error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT update transaction
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { id } = await params;
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

    // Check if transaction exists and belongs to user
    const existing = await prisma.transaction.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Validate type if provided
    if (type && type !== "income" && type !== "expense") {
      return NextResponse.json(
        { success: false, error: "Type must be 'income' or 'expense'" },
        { status: 400 }
      );
    }

    // Validate amount if provided
    if (amount !== undefined && amount <= 0) {
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

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        amount: amount !== undefined ? parseFloat(amount) : existing.amount,
        type: type !== undefined ? type : existing.type,
        categoryId: categoryId !== undefined ? categoryId : existing.categoryId,
        date: date !== undefined ? new Date(date) : existing.date,
        description: description !== undefined ? description : existing.description,
        paymentMethod: paymentMethod !== undefined ? paymentMethod : existing.paymentMethod,
        notes: notes !== undefined ? notes : existing.notes,
        tags: tags !== undefined ? tags : existing.tags,
        isRecurring: isRecurring !== undefined ? isRecurring : existing.isRecurring,
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
    console.error("Update transaction error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE transaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if transaction exists and belongs to user
    const existing = await prisma.transaction.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Transaction not found" },
        { status: 404 }
      );
    }

    await prisma.transaction.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    console.error("Delete transaction error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
