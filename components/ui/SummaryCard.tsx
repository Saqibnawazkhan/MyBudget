"use client";

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  valueColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  delay?: number;
}

export default function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = "text-primary",
  iconBgColor = "bg-primary/10",
  valueColor = "text-text-primary",
  trend,
  className,
  delay = 0,
}: SummaryCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-background-card border border-border rounded-xl p-6",
        "card-interactive animate-fade-in-up",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Background decoration */}
      <div
        className={cn(
          "absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50",
          iconBgColor
        )}
      />

      <div className="relative">
        <div className="flex items-center justify-between">
          <span className="text-text-secondary text-sm font-medium">
            {title}
          </span>
          <div className={cn("p-2 rounded-lg", iconBgColor)}>
            <Icon className={cn("w-5 h-5", iconColor)} />
          </div>
        </div>

        <p
          className={cn(
            "text-3xl font-bold mt-2 animate-count-up",
            valueColor
          )}
          style={{ animationDelay: `${delay + 200}ms` }}
        >
          {value}
        </p>

        <div className="flex items-center justify-between mt-1">
          {subtitle && (
            <p className="text-sm text-text-muted">{subtitle}</p>
          )}
          {trend && (
            <span
              className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full",
                trend.isPositive
                  ? "bg-accent-green/10 text-accent-green"
                  : "bg-accent-red/10 text-accent-red"
              )}
            >
              {trend.isPositive ? "+" : ""}{trend.value}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
