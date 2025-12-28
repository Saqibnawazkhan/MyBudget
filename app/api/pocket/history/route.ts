import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const now = new Date();
    const history = [];

    // Get last 12 months of history
    for (let i = 0; i < 12; i++) {
      const monthDate = subMonths(now, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);

      const transactions = await prisma.transaction.findMany({
        where: {
          userId: user.id,
          type: "expense",
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      });

      if (transactions.length > 0) {
        const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
        history.push({
          month: format(monthDate, "MMMM yyyy"),
          totalAmount,
          transactionCount: transactions.length,
          expanded: false,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error("Pocket history API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}
