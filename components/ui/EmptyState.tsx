"use client";

import { cn } from "@/lib/utils";
import { LucideIcon, Plus, FolderOpen } from "lucide-react";
import Button from "./Button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  className?: string;
}

export default function EmptyState({
  icon: Icon = FolderOpen,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  className,
}: EmptyStateProps) {
  const ActionWrapper = actionHref ? "a" : "div";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in",
        className
      )}
    >
      <div className="w-16 h-16 rounded-full bg-background-secondary flex items-center justify-center mb-4 animate-bounce-in">
        <Icon className="w-8 h-8 text-text-muted" />
      </div>

      <h3 className="text-lg font-semibold text-text-primary mb-2">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-text-muted max-w-sm mb-6">
          {description}
        </p>
      )}

      {actionLabel && (onAction || actionHref) && (
        <Button
          onClick={onAction}
          className="ripple btn-press"
          {...(actionHref ? { as: "a", href: actionHref } : {})}
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
