"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface SpendingPieChartProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  currency?: string;
}

export default function SpendingPieChart({
  data,
  currency = "USD",
}: SpendingPieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-text-muted">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) =>
            `${name} ${(percent * 100).toFixed(0)}%`
          }
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload;
              return (
                <div className="bg-background-card border border-border rounded-lg p-3 shadow-lg">
                  <p className="text-sm font-medium text-text-primary">
                    {data.name}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {formatCurrency(data.value, currency)}
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          content={({ payload }) => (
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {payload?.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-xs text-text-secondary">
                    {entry.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
