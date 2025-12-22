"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface IncomeExpenseBarChartProps {
  data: Array<{
    month: string;
    income: number;
    expense: number;
  }>;
  currency?: string;
}

export default function IncomeExpenseBarChart({
  data,
  currency = "USD",
}: IncomeExpenseBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-text-muted">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} barCategoryGap="20%">
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis
          dataKey="month"
          stroke="#64748b"
          tick={{ fill: "#64748b", fontSize: 12 }}
          axisLine={{ stroke: "#1e293b" }}
        />
        <YAxis
          stroke="#64748b"
          tick={{ fill: "#64748b", fontSize: 12 }}
          axisLine={{ stroke: "#1e293b" }}
          tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-background-card border border-border rounded-lg p-3 shadow-lg">
                  <p className="text-sm font-medium text-text-primary mb-2">
                    {label}
                  </p>
                  {payload.map((entry, index) => (
                    <p
                      key={index}
                      className="text-sm"
                      style={{ color: entry.color }}
                    >
                      {entry.name}: {formatCurrency(entry.value as number, currency)}
                    </p>
                  ))}
                </div>
              );
            }
            return null;
          }}
        />
        <Legend
          verticalAlign="top"
          height={36}
          content={({ payload }) => (
            <div className="flex justify-center gap-6 mb-2">
              {payload?.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-text-secondary capitalize">
                    {entry.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        />
        <Bar
          dataKey="income"
          name="Income"
          fill="#10b981"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="expense"
          name="Expense"
          fill="#ef4444"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
