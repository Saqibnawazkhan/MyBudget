"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface ExpenseLineChartProps {
  data: Array<{
    date: string;
    amount: number;
  }>;
  currency?: string;
}

export default function ExpenseLineChart({
  data,
  currency = "USD",
}: ExpenseLineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-text-muted">
        No data available
      </div>
    );
  }

  // Format dates for display
  const formattedData = data.map((item) => ({
    ...item,
    displayDate: new Date(item.date).getDate().toString(),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={formattedData}>
        <defs>
          <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis
          dataKey="displayDate"
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
                  <p className="text-sm text-text-muted">Day {label}</p>
                  <p className="text-sm font-medium text-primary">
                    {formatCurrency(payload[0].value as number, currency)}
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
        <Area
          type="monotone"
          dataKey="amount"
          stroke="#3b82f6"
          strokeWidth={2}
          fill="url(#colorAmount)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
