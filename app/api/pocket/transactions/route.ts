import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { startOfDay, endOfDay, format } from "date-fns";

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
    const dateParam = searchParams.get("date");

    if (!dateParam) {
      return NextResponse.json(
        { success: false, error: "Date parameter required" },
        { status: 400 }
      );
    }

    const selectedDate = new Date(dateParam);
    const dayStart = startOfDay(selectedDate);
    const dayEnd = endOfDay(selectedDate);

    // Get all transactions for the selected day
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        date: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
      include: {
        category: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    const formattedTransactions = transactions.map((t) => ({
      id: t.id,
      description: t.description || t.category?.name || "Transaction",
      amount: t.amount,
      time: format(t.date, "h:mm a"),
      categoryColor: t.category?.color || "#64748b",
      icon: t.category?.icon || "shopping",
    }));

    const total = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return NextResponse.json({
      success: true,
      data: {
        date: selectedDate,
        transactions: formattedTransactions,
        total,
      },
    });
  } catch (error) {
    console.error("Pocket transactions API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
