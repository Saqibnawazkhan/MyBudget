import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// PUT update budget
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
    const { amount } = body;

    // Check if budget exists and belongs to user
    const existing = await prisma.budget.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Budget not found" },
        { status: 404 }
      );
    }

    if (amount !== undefined && amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Amount must be positive" },
        { status: 400 }
      );
    }

    const budget = await prisma.budget.update({
      where: { id },
      data: {
        amount: amount !== undefined ? parseFloat(amount) : existing.amount,
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
    console.error("Update budget error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE budget
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

    // Check if budget exists and belongs to user
    const existing = await prisma.budget.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Budget not found" },
        { status: 404 }
      );
    }

    await prisma.budget.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Budget deleted successfully",
    });
  } catch (error) {
    console.error("Delete budget error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
