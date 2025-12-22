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
  ReferenceLine,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface BudgetComparisonChartProps {
  data: Array<{
    category: string;
    budget: number;
    actual: number;
  }>;
  currency?: string;
}

export default function BudgetComparisonChart({
  data,
  currency = "USD",
}: BudgetComparisonChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-text-muted">
        No budget data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={true} vertical={false} />
        <XAxis
          type="number"
          stroke="#64748b"
          tick={{ fill: "#64748b", fontSize: 12 }}
          axisLine={{ stroke: "#1e293b" }}
          tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
        />
        <YAxis
          type="category"
          dataKey="category"
          stroke="#64748b"
          tick={{ fill: "#64748b", fontSize: 12 }}
          axisLine={{ stroke: "#1e293b" }}
          width={100}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              const budget = payload.find((p) => p.dataKey === "budget");
              const actual = payload.find((p) => p.dataKey === "actual");
              const budgetVal = budget?.value as number || 0;
              const actualVal = actual?.value as number || 0;
              const diff = budgetVal - actualVal;

              return (
                <div className="bg-background-card border border-border rounded-lg p-3 shadow-lg">
                  <p className="text-sm font-medium text-text-primary mb-2">
                    {label}
                  </p>
                  <p className="text-sm text-accent-purple">
                    Budget: {formatCurrency(budgetVal, currency)}
                  </p>
                  <p className="text-sm text-primary">
                    Actual: {formatCurrency(actualVal, currency)}
                  </p>
                  <p className={`text-sm ${diff >= 0 ? "text-accent-green" : "text-accent-red"}`}>
                    {diff >= 0 ? "Under: " : "Over: "}
                    {formatCurrency(Math.abs(diff), currency)}
                  </p>
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
          dataKey="budget"
          name="Budget"
          fill="#8b5cf6"
          radius={[0, 4, 4, 0]}
        />
        <Bar
          dataKey="actual"
          name="Actual"
          fill="#3b82f6"
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
