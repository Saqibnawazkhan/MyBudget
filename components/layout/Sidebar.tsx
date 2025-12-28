"use client";

import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ArrowUpDown,
  Wallet,
  PieChart,
  FolderTree,
  Settings,
  LogOut,
  Menu,
  X,
  Eye,
  Smartphone,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import ThemeToggle from "@/components/ui/ThemeToggle";

const navItems: Array<{ href: string; icon: any; label: string; badge?: string }> = [
  { href: "/overview", icon: Eye, label: "Overview" },
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/pocket", icon: Smartphone, label: "Pocket Pro", badge: "Mobile" },
  { href: "/transactions", icon: ArrowUpDown, label: "Transactions" },
  { href: "/budgets", icon: Wallet, label: "Budgets" },
  { href: "/reports", icon: PieChart, label: "Reports" },
  { href: "/categories", icon: FolderTree, label: "Categories" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuthStore();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-background-card border border-border text-text-primary"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-screen w-64 bg-background-secondary border-r border-border z-50 flex flex-col transition-transform duration-300",
          "lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="text-xl font-bold text-text-primary">MyBudget</span>
          </Link>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-background-hover"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-text-secondary hover:bg-background-hover hover:text-text-primary transition-all duration-200",
                      isActive &&
                        "bg-primary/10 text-primary border-l-2 border-primary"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto px-2 py-0.5 bg-accent-green/20 text-accent-green text-xs font-semibold rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Theme Toggle & Footer */}
        <div className="px-4 py-4 border-t border-border space-y-3">
          {/* Theme Toggle */}
          <div className="px-2">
            <p className="text-xs font-medium text-text-muted mb-2 uppercase tracking-wider">
              Theme
            </p>
            <ThemeToggle />
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-text-secondary hover:bg-background-hover hover:text-accent-red transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
