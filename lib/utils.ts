import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatMonth(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });
}

export function getMonthKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function getMonthRange(monthKey: string): { start: Date; end: Date } {
  const [year, month] = monthKey.split("-").map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
}

export function percentageOf(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

export const CATEGORY_COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f97316", // orange
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#ef4444", // red
  "#f59e0b", // amber
  "#84cc16", // lime
  "#6366f1", // indigo
];

export const CATEGORY_ICONS = [
  "shopping-bag",
  "utensils",
  "car",
  "home",
  "heart",
  "briefcase",
  "graduation-cap",
  "plane",
  "gift",
  "music",
  "film",
  "gamepad",
  "wifi",
  "phone",
  "coffee",
  "tag",
];

export const DEFAULT_EXPENSE_CATEGORIES = [
  { name: "Food & Dining", color: "#f97316", icon: "utensils" },
  { name: "Transportation", color: "#3b82f6", icon: "car" },
  { name: "Shopping", color: "#ec4899", icon: "shopping-bag" },
  { name: "Bills & Utilities", color: "#8b5cf6", icon: "home" },
  { name: "Entertainment", color: "#06b6d4", icon: "film" },
  { name: "Healthcare", color: "#ef4444", icon: "heart" },
  { name: "Education", color: "#10b981", icon: "graduation-cap" },
  { name: "Travel", color: "#f59e0b", icon: "plane" },
];

export const DEFAULT_INCOME_CATEGORIES = [
  { name: "Salary", color: "#10b981", icon: "briefcase" },
  { name: "Freelance", color: "#3b82f6", icon: "laptop" },
  { name: "Investments", color: "#8b5cf6", icon: "trending-up" },
  { name: "Gifts", color: "#ec4899", icon: "gift" },
  { name: "Other Income", color: "#06b6d4", icon: "plus-circle" },
];

export const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "bank", label: "Bank Transfer" },
  { value: "other", label: "Other" },
];

export const CURRENCIES = [
  { value: "USD", label: "US Dollar ($)", symbol: "$" },
  { value: "EUR", label: "Euro (€)", symbol: "€" },
  { value: "GBP", label: "British Pound (£)", symbol: "£" },
  { value: "PKR", label: "Pakistani Rupee (₨)", symbol: "₨" },
  { value: "INR", label: "Indian Rupee (₹)", symbol: "₹" },
  { value: "CAD", label: "Canadian Dollar (C$)", symbol: "C$" },
  { value: "AUD", label: "Australian Dollar (A$)", symbol: "A$" },
  { value: "JPY", label: "Japanese Yen (¥)", symbol: "¥" },
];
