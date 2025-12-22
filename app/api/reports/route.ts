import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getMonthRange } from "@/lib/utils";
import { format, eachDayOfInterval } from "date-fns";

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

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json(
        { success: false, error: "Valid month parameter required (YYYY-MM)" },
        { status: 400 }
      );
    }

    const { start, end } = getMonthRange(month);

    // Get all transactions for the month
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        category: true,
      },
    });

    // Calculate totals
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const netSavings = totalIncome - totalExpense;

    // Category breakdown (expenses only)
    const expenseTransactions = transactions.filter((t) => t.type === "expense");
    const categoryMap = new Map<
      string,
      { name: string; color: string; total: number; count: number }
    >();

    for (const t of expenseTransactions) {
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

    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([categoryId, data]) => ({
        categoryId,
        categoryName: data.name,
        categoryColor: data.color,
        total: data.total,
        percentage:
          totalExpense > 0 ? Math.round((data.total / totalExpense) * 1000) / 10 : 0,
        transactionCount: data.count,
      }))
      .sort((a, b) => b.total - a.total);

    // Budget summary
    const budgets = await prisma.budget.findMany({
      where: {
        userId: user.id,
        month,
      },
      include: {
        category: true,
      },
    });

    const budgetSummary = budgets.map((budget) => {
      let actualSpent = 0;

      if (budget.categoryId) {
        // Category-specific budget
        actualSpent = expenseTransactions
          .filter((t) => t.categoryId === budget.categoryId)
          .reduce((sum, t) => sum + t.amount, 0);
      } else {
        // Overall budget
        actualSpent = totalExpense;
      }

      const difference = budget.amount - actualSpent;
      const percentUsed =
        budget.amount > 0 ? Math.round((actualSpent / budget.amount) * 1000) / 10 : 0;

      return {
        categoryId: budget.categoryId,
        categoryName: budget.category?.name || "Overall",
        budgetAmount: budget.amount,
        actualSpent,
        difference,
        percentUsed,
      };
    });

    // Daily expenses
    const days = eachDayOfInterval({ start, end });
    const dailyExpenses = days.map((day) => {
      const dayStr = format(day, "yyyy-MM-dd");
      const dayExpenses = expenseTransactions.filter(
        (t) => format(new Date(t.date), "yyyy-MM-dd") === dayStr
      );
      return {
        date: dayStr,
        amount: dayExpenses.reduce((sum, t) => sum + t.amount, 0),
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        month,
        totalIncome,
        totalExpense,
        netSavings,
        categoryBreakdown,
        budgetSummary,
        dailyExpenses,
      },
    });
  } catch (error) {
    console.error("Get report error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
