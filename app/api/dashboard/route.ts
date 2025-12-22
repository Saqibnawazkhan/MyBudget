import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getMonthKey, getMonthRange } from "@/lib/utils";
import { subMonths, format } from "date-fns";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const currentMonth = getMonthKey(new Date());
    const { start, end } = getMonthRange(currentMonth);

    // Get current month transactions
    const currentMonthTransactions = await prisma.transaction.findMany({
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
      orderBy: { date: "desc" },
    });

    // Calculate current month totals
    const totalIncome = currentMonthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = currentMonthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const netSavings = totalIncome - totalExpense;

    // Get recent transactions (last 5)
    const recentTransactions = currentMonthTransactions.slice(0, 5);

    // Get current month budgets with progress
    const budgets = await prisma.budget.findMany({
      where: {
        userId: user.id,
        month: currentMonth,
      },
      include: {
        category: true,
      },
    });

    const expenseTransactions = currentMonthTransactions.filter(
      (t) => t.type === "expense"
    );

    const budgetProgress = budgets.map((budget) => {
      let spent = 0;

      if (budget.categoryId) {
        spent = expenseTransactions
          .filter((t) => t.categoryId === budget.categoryId)
          .reduce((sum, t) => sum + t.amount, 0);
      } else {
        spent = totalExpense;
      }

      const percentUsed =
        budget.amount > 0 ? Math.round((spent / budget.amount) * 1000) / 10 : 0;

      return {
        id: budget.id,
        categoryName: budget.category?.name || "Overall",
        categoryColor: budget.category?.color || "#3b82f6",
        budgetAmount: budget.amount,
        spent,
        remaining: budget.amount - spent,
        percentUsed,
      };
    });

    // Get last 6 months income vs expense data for chart
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthKey = getMonthKey(date);
      const { start: monthStart, end: monthEnd } = getMonthRange(monthKey);

      const monthTransactions = await prisma.transaction.findMany({
        where: {
          userId: user.id,
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      });

      const income = monthTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = monthTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      monthlyData.push({
        month: format(date, "MMM"),
        income,
        expense,
      });
    }

    // Top spending categories this month
    const categoryMap = new Map<
      string,
      { name: string; color: string; total: number }
    >();

    for (const t of expenseTransactions) {
      const categoryId = t.categoryId || "uncategorized";
      const categoryName = t.category?.name || "Uncategorized";
      const categoryColor = t.category?.color || "#64748b";

      if (categoryMap.has(categoryId)) {
        const existing = categoryMap.get(categoryId)!;
        existing.total += t.amount;
      } else {
        categoryMap.set(categoryId, {
          name: categoryName,
          color: categoryColor,
          total: t.amount,
        });
      }
    }

    const topCategories = Array.from(categoryMap.entries())
      .map(([id, data]) => ({
        id,
        name: data.name,
        color: data.color,
        amount: data.total,
        percentage:
          totalExpense > 0 ? Math.round((data.total / totalExpense) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      data: {
        currentMonth,
        summary: {
          totalIncome,
          totalExpense,
          netSavings,
        },
        recentTransactions,
        budgetProgress,
        monthlyData,
        topCategories,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
