"use client";

import { useThemeStore } from "@/stores/themeStore";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  variant?: "icon" | "dropdown" | "buttons";
  className?: string;
}

export default function ThemeToggle({
  variant = "buttons",
  className,
}: ThemeToggleProps) {
  const { theme, setTheme } = useThemeStore();

  if (variant === "icon") {
    return (
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className={cn(
          "p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background-hover transition-colors",
          className
        )}
        title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      >
        {theme === "dark" ? (
          <Sun className="w-5 h-5" />
        ) : (
          <Moon className="w-5 h-5" />
        )}
      </button>
    );
  }

  if (variant === "dropdown") {
    return (
      <div className={cn("relative group", className)}>
        <button className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background-hover transition-colors">
          {theme === "dark" ? (
            <Moon className="w-5 h-5" />
          ) : theme === "light" ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Monitor className="w-5 h-5" />
          )}
        </button>
        <div className="absolute right-0 top-full mt-2 w-36 bg-background-card border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
          <button
            onClick={() => setTheme("light")}
            className={cn(
              "flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-background-hover transition-colors rounded-t-lg",
              theme === "light" ? "text-primary" : "text-text-secondary"
            )}
          >
            <Sun className="w-4 h-4" />
            Light
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={cn(
              "flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-background-hover transition-colors",
              theme === "dark" ? "text-primary" : "text-text-secondary"
            )}
          >
            <Moon className="w-4 h-4" />
            Dark
          </button>
          <button
            onClick={() => setTheme("system")}
            className={cn(
              "flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-background-hover transition-colors rounded-b-lg",
              theme === "system" ? "text-primary" : "text-text-secondary"
            )}
          >
            <Monitor className="w-4 h-4" />
            System
          </button>
        </div>
      </div>
    );
  }

  // Default: buttons variant
  return (
    <div
      className={cn(
        "flex items-center gap-1 p-1 bg-background-secondary rounded-lg",
        className
      )}
    >
      <button
        onClick={() => setTheme("light")}
        className={cn(
          "p-2 rounded-md transition-all",
          theme === "light"
            ? "bg-background-card text-primary shadow-sm"
            : "text-text-muted hover:text-text-secondary"
        )}
        title="Light mode"
      >
        <Sun className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={cn(
          "p-2 rounded-md transition-all",
          theme === "dark"
            ? "bg-background-card text-primary shadow-sm"
            : "text-text-muted hover:text-text-secondary"
        )}
        title="Dark mode"
      >
        <Moon className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme("system")}
        className={cn(
          "p-2 rounded-md transition-all",
          theme === "system"
            ? "bg-background-card text-primary shadow-sm"
            : "text-text-muted hover:text-text-secondary"
        )}
        title="System preference"
      >
        <Monitor className="w-4 h-4" />
      </button>
    </div>
  );
}
