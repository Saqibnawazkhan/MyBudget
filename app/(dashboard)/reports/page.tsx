"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { Card, Button, Select } from "@/components/ui";
import Header from "@/components/layout/Header";
import SpendingPieChart from "@/components/charts/SpendingPieChart";
import ExpenseLineChart from "@/components/charts/ExpenseLineChart";
import BudgetComparisonChart from "@/components/charts/BudgetComparisonChart";
import { formatCurrency, getMonthKey } from "@/lib/utils";
import { Download, FileSpreadsheet, FileText, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import type { MonthlyReport } from "@/types";

export default function ReportsPage() {
  const { user } = useAuthStore();
  const [selectedMonth, setSelectedMonth] = useState(getMonthKey(new Date()));
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/reports?month=${selectedMonth}`);
      const data = await response.json();
      if (data.success) {
        setReport(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [selectedMonth]);

  const handleExport = async (type: "excel" | "pdf") => {
    setIsExporting(true);
    try {
      const response = await fetch(`/api/export/${type}?month=${selectedMonth}`);
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Budget_Report_${selectedMonth}.${type === "excel" ? "xlsx" : "pdf"}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  // Generate month options
  const monthOptions = [];
  const now = new Date();
  for (let i = 0; i <= 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = getMonthKey(date);
    const label = date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    monthOptions.push({ value: key, label });
  }

  const currency = user?.currency || "USD";

  // Format display month
  const [year, month] = selectedMonth.split("-");
  const displayMonth = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric" }
  );

  return (
    <div className="py-6">
      <Header
        title="Monthly Reports"
        subtitle={`Financial overview for ${displayMonth}`}
      />

      {/* Controls */}
      <Card className="mt-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Select
              options={monthOptions}
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-48"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => handleExport("excel")}
              disabled={isExporting || isLoading}
            >
              <FileSpreadsheet className="w-4 h-4" />
              Export Excel
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleExport("pdf")}
              disabled={isExporting || isLoading}
            >
              <FileText className="w-4 h-4" />
              Export PDF
            </Button>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 bg-background-card border border-border rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
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
                <p className="text-3xl font-bold text-accent-green mt-2">
                  {formatCurrency(report?.totalIncome || 0, currency)}
                </p>
              </div>
            </Card>

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
                <p className="text-3xl font-bold text-accent-red mt-2">
                  {formatCurrency(report?.totalExpense || 0, currency)}
                </p>
              </div>
            </Card>

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
                    (report?.netSavings || 0) >= 0
                      ? "text-accent-green"
                      : "text-accent-red"
                  }`}
                >
                  {formatCurrency(report?.netSavings || 0, currency)}
                </p>
              </div>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Spending by Category */}
            <Card>
              <h3 className="text-lg font-semibold text-text-primary mb-6">
                Spending by Category
              </h3>
              <SpendingPieChart
                data={
                  report?.categoryBreakdown.map((cat) => ({
                    name: cat.categoryName,
                    value: cat.total,
                    color: cat.categoryColor,
                  })) || []
                }
                currency={currency}
              />
            </Card>

            {/* Daily Expenses */}
            <Card>
              <h3 className="text-lg font-semibold text-text-primary mb-6">
                Daily Expenses
              </h3>
              <ExpenseLineChart
                data={report?.dailyExpenses || []}
                currency={currency}
              />
            </Card>
          </div>

          {/* Budget vs Actual */}
          {report?.budgetSummary && report.budgetSummary.length > 0 && (
            <Card className="mt-6">
              <h3 className="text-lg font-semibold text-text-primary mb-6">
                Budget vs Actual
              </h3>
              <BudgetComparisonChart
                data={report.budgetSummary.map((b) => ({
                  category: b.categoryName,
                  budget: b.budgetAmount,
                  actual: b.actualSpent,
                }))}
                currency={currency}
              />
            </Card>
          )}

          {/* Category Breakdown Table */}
          <Card className="mt-6">
            <h3 className="text-lg font-semibold text-text-primary mb-6">
              Category Breakdown
            </h3>
            {report?.categoryBreakdown && report.categoryBreakdown.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-text-muted uppercase">
                        Category
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-text-muted uppercase">
                        Total Spent
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-text-muted uppercase">
                        % of Total
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-text-muted uppercase">
                        Transactions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.categoryBreakdown.map((cat) => (
                      <tr
                        key={cat.categoryId}
                        className="border-b border-border hover:bg-background-hover transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: cat.categoryColor }}
                            />
                            <span className="text-sm font-medium text-text-primary">
                              {cat.categoryName}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="text-sm text-text-primary">
                            {formatCurrency(cat.total, currency)}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="text-sm text-text-secondary">
                            {cat.percentage}%
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="text-sm text-text-secondary">
                            {cat.transactionCount}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-background-secondary">
                      <td className="py-4 px-4">
                        <span className="text-sm font-semibold text-text-primary">
                          Total
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-sm font-semibold text-text-primary">
                          {formatCurrency(report.totalExpense, currency)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-sm font-semibold text-text-primary">
                          100%
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-sm font-semibold text-text-primary">
                          {report.categoryBreakdown.reduce(
                            (sum, cat) => sum + cat.transactionCount,
                            0
                          )}
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-text-muted">
                No expense data for this month
              </div>
            )}
          </Card>

          {/* Budget Summary Table */}
          {report?.budgetSummary && report.budgetSummary.length > 0 && (
            <Card className="mt-6">
              <h3 className="text-lg font-semibold text-text-primary mb-6">
                Budget Summary
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-text-muted uppercase">
                        Category
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-text-muted uppercase">
                        Budget
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-text-muted uppercase">
                        Actual
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-text-muted uppercase">
                        Difference
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-text-muted uppercase">
                        % Used
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.budgetSummary.map((budget) => (
                      <tr
                        key={budget.categoryId || "overall"}
                        className="border-b border-border hover:bg-background-hover transition-colors"
                      >
                        <td className="py-4 px-4">
                          <span className="text-sm font-medium text-text-primary">
                            {budget.categoryName}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="text-sm text-text-primary">
                            {formatCurrency(budget.budgetAmount, currency)}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="text-sm text-text-primary">
                            {formatCurrency(budget.actualSpent, currency)}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span
                            className={`text-sm font-medium ${
                              budget.difference >= 0
                                ? "text-accent-green"
                                : "text-accent-red"
                            }`}
                          >
                            {budget.difference >= 0 ? "+" : ""}
                            {formatCurrency(budget.difference, currency)}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span
                            className={`text-sm ${
                              budget.percentUsed >= 100
                                ? "text-accent-red"
                                : budget.percentUsed >= 80
                                ? "text-yellow-500"
                                : "text-accent-green"
                            }`}
                          >
                            {budget.percentUsed}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
