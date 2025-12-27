"use client";

import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "gradient";
  hover?: boolean;
  animated?: boolean;
  delay?: number;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", hover = false, animated = false, delay = 0, children, ...props }, ref) => {
    const variants = {
      default: "bg-background-card border border-border",
      glass: "glass",
      gradient:
        "bg-gradient-to-br from-background-card to-background-secondary border border-border",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl p-6 transition-all duration-300",
          variants[variant],
          hover && "card-interactive hover:border-border-light",
          animated && "animate-fade-in-up",
          className
        )}
        style={animated && delay > 0 ? { animationDelay: `${delay}ms` } : undefined}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export default Card;
