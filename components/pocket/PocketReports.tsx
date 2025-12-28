"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { formatCurrency } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import { Plus, ChevronDown } from "lucide-react";
import QuickAddModal from "./QuickAddModal";

interface ReportData {
  monthlyExpenses: Array<{ month: string; amount: number }>;
  categoryBreakdown: Array<{ name: string; amount: number; count: number; color: string }>;
  totalExpenses: number;
  selectedPeriod: string;
}

export default function PocketReports() {
  const { user } = useAuthStore();
  const [data, setData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("Last 6 months");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch("/api/pocket/reports");
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const currency = user?.currency || "USD";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-text-muted">Loading...</div>
      </div>
    );
  }

  const maxExpense = Math.max(...(data?.monthlyExpenses.map(d => d.amount) || [0]));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pt-4">
        <h1 className="text-2xl font-bold text-text-primary mb-2">Reports</h1>
        <div className="flex items-center gap-4 text-sm">
          <button className="px-4 py-2 bg-primary/10 text-primary rounded-lg font-medium">
            Expenses per Category
          </button>
          <button className="px-4 py-2 text-text-muted">Monthly Savings</button>
          <button className="px-4 py-2 text-text-muted">Weekday Savings</button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <button className="flex items-center gap-2 text-sm text-text-primary font-medium">
          {selectedPeriod} <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Bar Chart */}
      <div className="bg-background-secondary rounded-2xl p-4">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data?.monthlyExpenses || []}>
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9CA3AF", fontSize: 12 }}
            />
            <YAxis hide />
            <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
              {data?.monthlyExpenses.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.amount === maxExpense ? "#3B82F6" : "#93C5FD"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* History Section */}
      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-4">History</h2>
        <div className="space-y-3">
          {data?.categoryBreakdown && data.categoryBreakdown.length > 0 ? (
            data.categoryBreakdown.map((category) => (
              <div
                key={category.name}
                className="bg-background-secondary rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <div>
                    <p className="font-medium text-text-primary">{category.name}</p>
                    <p className="text-xs text-text-muted">{category.count} transactions</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-text-primary">
                    {formatCurrency(category.amount, currency)}
                  </p>
                  <ChevronDown className="w-4 h-4 text-text-muted" />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-text-muted text-sm">
              No expense data yet
            </div>
          )}
        </div>
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
      >
        <Plus className="w-6 h-6 text-white" />
      </button>

      {/* Quick Add Modal */}
      {showAddModal && (
        <QuickAddModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchReports();
          }}
        />
      )}
    </div>
  );
}
