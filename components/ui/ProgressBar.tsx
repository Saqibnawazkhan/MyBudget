"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function ProgressBar({
  value,
  max = 100,
  color,
  showLabel = false,
  size = "md",
  className,
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  const getColor = () => {
    if (color) return color;
    if (percentage >= 100) return "#ef4444"; // red
    if (percentage >= 80) return "#f59e0b"; // amber
    return "#3b82f6"; // blue
  };

  const sizes = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-sm text-text-secondary">
            {value.toLocaleString()}
          </span>
          <span className="text-sm text-text-muted">
            {percentage.toFixed(0)}%
          </span>
        </div>
      )}
      <div
        className={cn(
          "w-full bg-background-hover rounded-full overflow-hidden",
          sizes[size]
        )}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: getColor(),
          }}
        />
      </div>
    </div>
  );
}
