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

    const userId = user.id;

    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);

    // Get total transactions count
    const totalTransactions = await prisma.transaction.count({
      where: { userId },
    });

    // Get total revenue (total income)
    const totalIncomeResult = await prisma.transaction.aggregate({
      where: {
        userId,
        type: "income",
      },
      _sum: {
        amount: true,
      },
    });
    const totalRevenue = totalIncomeResult._sum.amount || 0;

    // Get current month income for subscribers calculation
    const currentMonthIncome = await prisma.transaction.aggregate({
      where: {
        userId,
        type: "income",
        date: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Get previous month income for growth calculation
    const previousMonthStart = startOfMonth(subMonths(now, 1));
    const previousMonthEnd = endOfMonth(subMonths(now, 1));
    const previousMonthIncome = await prisma.transaction.aggregate({
      where: {
        userId,
        type: "income",
        date: {
          gte: previousMonthStart,
          lte: previousMonthEnd,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const currentIncome = currentMonthIncome._sum.amount || 0;
    const previousIncome = previousMonthIncome._sum.amount || 0;
    const growth =
      previousIncome > 0
        ? ((currentIncome - previousIncome) / previousIncome) * 100
        : 0;
    const revenueGrowth = `${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`;

    // Mock subscribers data (you can replace with actual logic)
    const subscribers = Math.floor(totalTransactions * 0.6);
    const notSubscribed = totalTransactions - subscribers;

    // Get activity data for the last 6 months
    const activityData = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);

      const transactionCount = await prisma.transaction.count({
        where: {
          userId,
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      });

      activityData.push({
        month: format(monthDate, "MMM"),
        value: transactionCount,
      });
    }

    // Get latest transactions
    const latestTransactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 5,
      include: {
        category: true,
      },
    });

    const formattedTransactions = latestTransactions.map((t) => ({
      id: t.id,
      description: t.description || t.category?.name || "Transaction",
      amount: t.amount,
      date: t.date.toISOString(),
      status: "Paid",
    }));

    // Get latest categories
    const latestCategories = await prisma.category.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 8,
    });

    const latestRegistrations = latestCategories.map((c) => ({
      id: c.id,
      name: c.name,
      date: c.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalTransactions,
        totalRevenue,
        subscribers,
        notSubscribed,
        revenueGrowth,
        activityData,
        latestTransactions: formattedTransactions,
        latestRegistrations,
      },
    });
  } catch (error) {
    console.error("Overview API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch overview data" },
      { status: 500 }
    );
  }
}
