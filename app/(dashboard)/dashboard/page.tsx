"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { Card, ProgressBar, SummaryCard, EmptyState, SkeletonCard, QuickAction } from "@/components/ui";
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
        <Header title="Dashboard" subtitle="Loading your financial overview..." />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card className="h-80">
            <div className="skeleton w-full h-full" />
          </Card>
          <Card className="h-80">
            <div className="skeleton w-full h-full" />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="animate-fade-in-up">
        <Header
          title="Dashboard"
          subtitle={`Welcome back, ${user?.name || "User"}! Here's your financial overview.`}
        />
      </div>

      {/* Summary Cards - Using reusable SummaryCard component */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <SummaryCard
          title="Total Income"
          value={formatCurrency(data?.summary.totalIncome || 0, currency)}
          subtitle={formatMonth(new Date())}
          icon={TrendingUp}
          iconColor="text-accent-green"
          iconBgColor="bg-accent-green/10"
          delay={0}
        />
        <SummaryCard
          title="Total Expense"
          value={formatCurrency(data?.summary.totalExpense || 0, currency)}
          subtitle={formatMonth(new Date())}
          icon={TrendingDown}
          iconColor="text-accent-red"
          iconBgColor="bg-accent-red/10"
          delay={100}
        />
        <SummaryCard
          title="Net Savings"
          value={formatCurrency(data?.summary.netSavings || 0, currency)}
          subtitle={formatMonth(new Date())}
          icon={Wallet}
          iconColor="text-primary"
          iconBgColor="bg-primary/10"
          valueColor={(data?.summary.netSavings || 0) >= 0 ? "text-accent-green" : "text-accent-red"}
          delay={200}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card animated delay={300} hover>
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

        <Card animated delay={400} hover>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-text-primary">
              Spending by Category
            </h3>
            <Link
              href="/reports"
              className="text-sm text-primary hover:underline transition-colors"
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
        <Card animated delay={500} hover>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-text-primary">
              Budget Progress
            </h3>
            <Link
              href="/budgets"
              className="text-sm text-primary hover:underline transition-colors"
            >
              Manage Budgets
            </Link>
          </div>
          {data?.budgetProgress && data.budgetProgress.length > 0 ? (
            <div className="space-y-4">
              {data.budgetProgress.map((budget, index) => (
                <div
                  key={budget.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${500 + index * 50}ms` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full transition-transform hover:scale-125"
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
            <EmptyState
              icon={PiggyBank}
              title="No budgets configured"
              description="Set up budgets to track your spending limits"
              actionLabel="Set up a budget"
              actionHref="/budgets"
            />
          )}
        </Card>

        <Card animated delay={600} hover>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-text-primary">
              Recent Transactions
            </h3>
            <Link
              href="/transactions"
              className="text-sm text-primary hover:underline transition-colors"
            >
              View All
            </Link>
          </div>
          {data?.recentTransactions && data.recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {data.recentTransactions.map((transaction, index) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 bg-background-secondary rounded-lg
                    transition-all duration-300 hover:bg-background-hover hover:translate-x-1
                    animate-fade-in-up cursor-pointer"
                  style={{ animationDelay: `${600 + index * 50}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg transition-transform hover:scale-110 ${
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
            <EmptyState
              icon={Wallet}
              title="No transactions yet"
              description="Start tracking your income and expenses"
              actionLabel="Add your first transaction"
              actionHref="/transactions"
            />
          )}
        </Card>
      </div>

      {/* Quick Actions - Using reusable QuickAction component */}
      <div className="mt-6 animate-fade-in-up" style={{ animationDelay: "700ms" }}>
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickAction
            href="/transactions?action=add&type=expense"
            icon={ArrowDownRight}
            label="Add Expense"
            iconColor="text-accent-red"
            iconBgColor="bg-accent-red/10"
            hoverBorderColor="hover:border-accent-red/50"
            delay={750}
          />
          <QuickAction
            href="/transactions?action=add&type=income"
            icon={ArrowUpRight}
            label="Add Income"
            iconColor="text-accent-green"
            iconBgColor="bg-accent-green/10"
            hoverBorderColor="hover:border-accent-green/50"
            delay={800}
          />
          <QuickAction
            href="/budgets"
            icon={Wallet}
            label="Set Budget"
            iconColor="text-accent-purple"
            iconBgColor="bg-accent-purple/10"
            hoverBorderColor="hover:border-accent-purple/50"
            delay={850}
          />
          <QuickAction
            href="/reports"
            icon={TrendingUp}
            label="View Reports"
            iconColor="text-primary"
            iconBgColor="bg-primary/10"
            hoverBorderColor="hover:border-primary/50"
            delay={900}
          />
        </div>
      </div>
    </div>
  );
}
