"use client";

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface QuickActionProps {
  href: string;
  icon: LucideIcon;
  label: string;
  iconColor?: string;
  iconBgColor?: string;
  hoverBorderColor?: string;
  delay?: number;
}

export default function QuickAction({
  href,
  icon: Icon,
  label,
  iconColor = "text-primary",
  iconBgColor = "bg-primary/10",
  hoverBorderColor = "hover:border-primary/50",
  delay = 0,
}: QuickActionProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 p-4 bg-background-card border border-border rounded-xl",
        "transition-all duration-300 card-interactive ripple",
        hoverBorderColor,
        "animate-fade-in-up"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={cn("p-2 rounded-lg transition-transform group-hover:scale-110", iconBgColor)}>
        <Icon className={cn("w-5 h-5", iconColor)} />
      </div>
      <span className="text-sm font-medium text-text-primary">
        {label}
      </span>
    </Link>
  );
}
