"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { Card, ProgressBar, SummaryCard, EmptyState, SkeletonCard } from "@/components/ui";
import Header from "@/components/layout/Header";
import SpendingPieChart from "@/components/charts/SpendingPieChart";
import IncomeExpenseBarChart from "@/components/charts/IncomeExpenseBarChart";
import { formatCurrency, formatDate, formatMonth } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  Plus,
} from "lucide-react";
import Link from "next/link";

interface DashboardData {
  currentMonth: string;
  summary: {
    totalIncome: number;
    totalExpense: number;
    netSavings: number;
  };
  recentTransactions: Array<{
    id: string;
    amount: number;
    type: string;
    description: string | null;
    date: string;
    category: { name: string; color: string } | null;
  }>;
  budgetProgress: Array<{
    id: string;
    categoryName: string;
    categoryColor: string;
    budgetAmount: number;
    spent: number;
    remaining: number;
    percentUsed: number;
  }>;
  monthlyData: Array<{
    month: string;
    income: number;
    expense: number;
  }>;
  topCategories: Array<{
    id: string;
    name: string;
    color: string;
    amount: number;
    percentage: number;
  }>;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch("/api/dashboard");
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const currency = user?.currency || "USD";

  if (isLoading) {
    return (
      <div className="py-6 animate-fade-in">
        <Header title="Dashboard" subtitle="Loading..." />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      {/* Welcome Header */}
      <div className="animate-fade-in-up">
        <Header
          title={`Hi, ${user?.name?.split(" ")[0] || "there"}!`}
          subtitle={formatMonth(new Date())}
        />
      </div>

      {/* Summary Cards - Compact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <SummaryCard
          title="Income"
          value={formatCurrency(data?.summary.totalIncome || 0, currency)}
          icon={TrendingUp}
          iconColor="text-accent-green"
          iconBgColor="bg-accent-green/10"
          delay={0}
        />
        <SummaryCard
          title="Expenses"
          value={formatCurrency(data?.summary.totalExpense || 0, currency)}
          icon={TrendingDown}
          iconColor="text-accent-red"
          iconBgColor="bg-accent-red/10"
          delay={50}
        />
        <SummaryCard
          title="Savings"
          value={formatCurrency(data?.summary.netSavings || 0, currency)}
          icon={Wallet}
          iconColor="text-primary"
          iconBgColor="bg-primary/10"
          valueColor={(data?.summary.netSavings || 0) >= 0 ? "text-accent-green" : "text-accent-red"}
          delay={100}
        />
      </div>

      {/* Main Content - Two Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Left Column - Charts (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Income vs Expense Chart */}
          <Card animated delay={150}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-text-primary">Overview</h3>
              <span className="text-xs text-text-muted">Last 6 months</span>
            </div>
            <IncomeExpenseBarChart
              data={data?.monthlyData || []}
              currency={currency}
            />
          </Card>

          {/* Spending by Category */}
          <Card animated delay={200}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-text-primary">Spending</h3>
              <Link href="/reports" className="text-xs text-primary hover:underline">
                See all
              </Link>
            </div>
            {data?.topCategories && data.topCategories.length > 0 ? (
              <SpendingPieChart
                data={data.topCategories.map((cat) => ({
                  name: cat.name,
                  value: cat.amount,
                  color: cat.color,
                }))}
                currency={currency}
              />
            ) : (
              <div className="py-8 text-center text-text-muted text-sm">
                No spending data yet
              </div>
            )}
          </Card>
        </div>

        {/* Right Column - Quick Info (1/3) */}
        <div className="space-y-6">
          {/* Quick Add */}
          <Card animated delay={250} className="bg-gradient-to-br from-primary to-primary-dark">
            <div className="text-white">
              <h3 className="font-semibold mb-2">Quick Add</h3>
              <p className="text-sm text-white/70 mb-4">Record a new transaction</p>
              <div className="flex gap-2">
                <Link
                  href="/transactions?action=add&type=expense"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
                >
                  <ArrowDownRight className="w-4 h-4" />
                  Expense
                </Link>
                <Link
                  href="/transactions?action=add&type=income"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  Income
                </Link>
              </div>
            </div>
          </Card>

          {/* Budget Progress */}
          <Card animated delay={300}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-text-primary">Budgets</h3>
              <Link href="/budgets" className="text-xs text-primary hover:underline">
                Manage
              </Link>
            </div>
            {data?.budgetProgress && data.budgetProgress.length > 0 ? (
              <div className="space-y-4">
                {data.budgetProgress.slice(0, 4).map((budget) => (
                  <div key={budget.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: budget.categoryColor }}
                        />
                        <span className="text-sm text-text-primary">
                          {budget.categoryName}
                        </span>
                      </div>
                      <span className="text-xs text-text-muted">
                        {Math.round(budget.percentUsed)}%
                      </span>
                    </div>
                    <ProgressBar
                      value={budget.spent}
                      max={budget.budgetAmount}
                      color={budget.categoryColor}
                      size="sm"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={PiggyBank}
                title="No budgets yet"
                description="Set spending limits"
                actionLabel="Create"
                actionHref="/budgets"
              />
            )}
          </Card>

          {/* Recent Transactions */}
          <Card animated delay={350}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-text-primary">Recent</h3>
              <Link href="/transactions" className="text-xs text-primary hover:underline">
                See all
              </Link>
            </div>
            {data?.recentTransactions && data.recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {data.recentTransactions.slice(0, 5).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-1.5 rounded-lg ${
                          transaction.type === "income"
                            ? "bg-accent-green/10"
                            : "bg-accent-red/10"
                        }`}
                      >
                        {transaction.type === "income" ? (
                          <ArrowUpRight className="w-3.5 h-3.5 text-accent-green" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5 text-accent-red" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-text-primary truncate max-w-[120px]">
                          {transaction.description ||
                            transaction.category?.name ||
                            "Transaction"}
                        </p>
                        <p className="text-xs text-text-muted">
                          {formatDate(transaction.date)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        transaction.type === "income"
                          ? "text-accent-green"
                          : "text-accent-red"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount, currency)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Wallet}
                title="No transactions"
                description="Start tracking"
                actionLabel="Add"
                actionHref="/transactions"
              />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
