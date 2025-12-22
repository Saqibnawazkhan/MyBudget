"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { Card, Badge, ProgressBar } from "@/components/ui";
import Header from "@/components/layout/Header";
import SpendingPieChart from "@/components/charts/SpendingPieChart";
import IncomeExpenseBarChart from "@/components/charts/IncomeExpenseBarChart";
import { formatCurrency, formatDate, formatMonth } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
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

  if (isLoading) {
    return (
      <div className="py-6">
        <Header title="Dashboard" subtitle="Loading your financial overview..." />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 bg-background-card border border-border rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  const currency = user?.currency || "USD";

  return (
    <div className="py-6">
      <Header
        title="Dashboard"
        subtitle={`Welcome back, ${user?.name || "User"}! Here's your financial overview.`}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Income Card */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-green/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary text-sm font-medium">
                Total Income
              </span>
              <div className="p-2 bg-accent-green/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-accent-green" />
              </div>
            </div>
            <p className="text-3xl font-bold text-text-primary mt-2">
              {formatCurrency(data?.summary.totalIncome || 0, currency)}
            </p>
            <p className="text-sm text-text-muted mt-1">
              {formatMonth(new Date())}
            </p>
          </div>
        </Card>

        {/* Expense Card */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-red/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary text-sm font-medium">
                Total Expense
              </span>
              <div className="p-2 bg-accent-red/10 rounded-lg">
                <TrendingDown className="w-5 h-5 text-accent-red" />
              </div>
            </div>
            <p className="text-3xl font-bold text-text-primary mt-2">
              {formatCurrency(data?.summary.totalExpense || 0, currency)}
            </p>
            <p className="text-sm text-text-muted mt-1">
              {formatMonth(new Date())}
            </p>
          </div>
        </Card>

        {/* Net Savings Card */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary text-sm font-medium">
                Net Savings
              </span>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p
              className={`text-3xl font-bold mt-2 ${
                (data?.summary.netSavings || 0) >= 0
                  ? "text-accent-green"
                  : "text-accent-red"
              }`}
            >
              {formatCurrency(data?.summary.netSavings || 0, currency)}
            </p>
            <p className="text-sm text-text-muted mt-1">
              {formatMonth(new Date())}
            </p>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Income vs Expense Chart */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-text-primary">
              Income vs Expense
            </h3>
            <span className="text-sm text-text-muted">Last 6 months</span>
          </div>
          <IncomeExpenseBarChart
            data={data?.monthlyData || []}
            currency={currency}
          />
        </Card>

        {/* Spending by Category */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-text-primary">
              Spending by Category
            </h3>
            <Link
              href="/reports"
              className="text-sm text-primary hover:underline"
            >
              View Report
            </Link>
          </div>
          <SpendingPieChart
            data={
              data?.topCategories.map((cat) => ({
                name: cat.name,
                value: cat.amount,
                color: cat.color,
              })) || []
            }
            currency={currency}
          />
        </Card>
      </div>

      {/* Budget Progress & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Budget Progress */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-text-primary">
              Budget Progress
            </h3>
            <Link
              href="/budgets"
              className="text-sm text-primary hover:underline"
            >
              Manage Budgets
            </Link>
          </div>
          {data?.budgetProgress && data.budgetProgress.length > 0 ? (
            <div className="space-y-4">
              {data.budgetProgress.map((budget) => (
                <div key={budget.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: budget.categoryColor }}
                      />
                      <span className="text-sm font-medium text-text-primary">
                        {budget.categoryName}
                      </span>
                    </div>
                    <span className="text-sm text-text-secondary">
                      {formatCurrency(budget.spent, currency)} /{" "}
                      {formatCurrency(budget.budgetAmount, currency)}
                    </span>
                  </div>
                  <ProgressBar
                    value={budget.spent}
                    max={budget.budgetAmount}
                    color={budget.categoryColor}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-text-muted mb-4">No budgets configured</p>
              <Link
                href="/budgets"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                <Plus className="w-4 h-4" />
                Set up a budget
              </Link>
            </div>
          )}
        </Card>

        {/* Recent Transactions */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-text-primary">
              Recent Transactions
            </h3>
            <Link
              href="/transactions"
              className="text-sm text-primary hover:underline"
            >
              View All
            </Link>
          </div>
          {data?.recentTransactions && data.recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {data.recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 bg-background-secondary rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        transaction.type === "income"
                          ? "bg-accent-green/10"
                          : "bg-accent-red/10"
                      }`}
                    >
                      {transaction.type === "income" ? (
                        <ArrowUpRight className="w-4 h-4 text-accent-green" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-accent-red" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">
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
                    className={`text-sm font-semibold ${
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
            <div className="text-center py-8">
              <p className="text-text-muted mb-4">No transactions yet</p>
              <Link
                href="/transactions"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                <Plus className="w-4 h-4" />
                Add your first transaction
              </Link>
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/transactions?action=add&type=expense"
            className="flex items-center gap-3 p-4 bg-background-card border border-border rounded-xl hover:border-accent-red/50 transition-colors"
          >
            <div className="p-2 bg-accent-red/10 rounded-lg">
              <ArrowDownRight className="w-5 h-5 text-accent-red" />
            </div>
            <span className="text-sm font-medium text-text-primary">
              Add Expense
            </span>
          </Link>
          <Link
            href="/transactions?action=add&type=income"
            className="flex items-center gap-3 p-4 bg-background-card border border-border rounded-xl hover:border-accent-green/50 transition-colors"
          >
            <div className="p-2 bg-accent-green/10 rounded-lg">
              <ArrowUpRight className="w-5 h-5 text-accent-green" />
            </div>
            <span className="text-sm font-medium text-text-primary">
              Add Income
            </span>
          </Link>
          <Link
            href="/budgets"
            className="flex items-center gap-3 p-4 bg-background-card border border-border rounded-xl hover:border-accent-purple/50 transition-colors"
          >
            <div className="p-2 bg-accent-purple/10 rounded-lg">
              <Wallet className="w-5 h-5 text-accent-purple" />
            </div>
            <span className="text-sm font-medium text-text-primary">
              Set Budget
            </span>
          </Link>
          <Link
            href="/reports"
            className="flex items-center gap-3 p-4 bg-background-card border border-border rounded-xl hover:border-primary/50 transition-colors"
          >
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-text-primary">
              View Reports
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
