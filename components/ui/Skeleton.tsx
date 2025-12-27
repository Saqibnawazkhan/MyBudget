"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "card";
  width?: string | number;
  height?: string | number;
  count?: number;
}

export default function Skeleton({
  className,
  variant = "rectangular",
  width,
  height,
  count = 1,
}: SkeletonProps) {
  const variants = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg",
    card: "rounded-xl h-32",
  };

  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <>
      {items.map((i) => (
        <div
          key={i}
          className={cn("skeleton", variants[variant], className)}
          style={{
            width: width,
            height: height,
          }}
        />
      ))}
    </>
  );
}

// Predefined skeleton layouts for common use cases
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-background-card border border-border rounded-xl p-6 space-y-4",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <Skeleton variant="text" className="w-24" />
        <Skeleton variant="circular" width={40} height={40} />
      </div>
      <Skeleton variant="text" className="w-32 h-8" />
      <Skeleton variant="text" className="w-20" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 bg-background-secondary rounded-lg"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <Skeleton variant="circular" width={40} height={40} />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" className="w-3/4" />
            <Skeleton variant="text" className="w-1/2 h-3" />
          </div>
          <Skeleton variant="text" className="w-20" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonList({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }, (_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 bg-background-secondary rounded-lg animate-fade-in"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <Skeleton variant="rectangular" width={40} height={40} className="rounded-lg" />
          <div className="flex-1">
            <Skeleton variant="text" className="w-2/3 mb-2" />
            <Skeleton variant="text" className="w-1/3 h-3" />
          </div>
          <Skeleton variant="text" className="w-16" />
        </div>
      ))}
    </div>
  );
}
