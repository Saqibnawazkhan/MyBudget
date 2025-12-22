"use client";

import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "gradient";
  hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", hover = false, children, ...props }, ref) => {
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
          "rounded-xl p-6 transition-all duration-200",
          variants[variant],
          hover && "hover:border-border-light hover:shadow-lg",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export default Card;
