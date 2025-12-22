"use client";

import { cn } from "@/lib/utils";

interface BadgeProps {
  variant?: "default" | "income" | "expense" | "warning" | "success" | "info";
  children: React.ReactNode;
  className?: string;
}

export default function Badge({
  variant = "default",
  children,
  className,
}: BadgeProps) {
  const variants = {
    default: "bg-background-hover text-text-secondary",
    income: "bg-green-500/20 text-green-400",
    expense: "bg-red-500/20 text-red-400",
    warning: "bg-yellow-500/20 text-yellow-400",
    success: "bg-green-500/20 text-green-400",
    info: "bg-blue-500/20 text-blue-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
