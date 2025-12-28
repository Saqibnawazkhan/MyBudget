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

    // Get last 6 months expenses for bar chart
    const monthlyExpenses = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);

      const expenses = await prisma.transaction.aggregate({
        where: {
          userId: user.id,
          type: "expense",
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        _sum: {
          amount: true,
        },
      });

      monthlyExpenses.push({
        month: format(monthDate, "MMM"),
        amount: expenses._sum.amount || 0,
      });
    }

    // Get category breakdown for current month
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        type: "expense",
        date: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
      },
      include: {
        category: true,
      },
    });

    // Group by category
    const categoryMap = new Map<
      string,
      { name: string; color: string; total: number; count: number }
    >();

    for (const t of transactions) {
      const categoryId = t.categoryId || "uncategorized";
      const categoryName = t.category?.name || "Uncategorized";
      const categoryColor = t.category?.color || "#64748b";

      if (categoryMap.has(categoryId)) {
        const existing = categoryMap.get(categoryId)!;
        existing.total += t.amount;
        existing.count += 1;
      } else {
        categoryMap.set(categoryId, {
          name: categoryName,
          color: categoryColor,
          total: t.amount,
          count: 1,
        });
      }
    }

    const categoryBreakdown = Array.from(categoryMap.values())
      .map((data) => ({
        name: data.name,
        amount: data.total,
        count: data.count,
        color: data.color,
      }))
      .sort((a, b) => b.amount - a.amount);

    const totalExpenses = transactions.reduce((sum, t) => sum + t.amount, 0);

    return NextResponse.json({
      success: true,
      data: {
        monthlyExpenses,
        categoryBreakdown,
        totalExpenses,
        selectedPeriod: "Last 6 months",
      },
    });
  } catch (error) {
    console.error("Pocket reports API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
