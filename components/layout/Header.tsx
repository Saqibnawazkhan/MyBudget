"use client";

import { useAuthStore } from "@/stores/authStore";
import { Bell, Search } from "lucide-react";
import { formatMonth } from "@/lib/utils";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { user } = useAuthStore();

  return (
    <header className="flex items-center justify-between py-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
        {subtitle && (
          <p className="text-text-secondary mt-1">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-background-card border border-border rounded-lg">
          <Search className="w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent border-none outline-none text-sm text-text-primary placeholder-text-muted w-40"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg bg-background-card border border-border text-text-secondary hover:text-text-primary hover:bg-background-hover transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent-red rounded-full" />
        </button>

        {/* User info */}
        <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-border">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
            </span>
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-medium text-text-primary">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-text-muted">
              {formatMonth(new Date())}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
