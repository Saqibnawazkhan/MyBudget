"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { LayoutDashboard, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ModeSwitcher() {
  const router = useRouter();
  const { user, updateSettings } = useAuthStore();

  const handleSwitchMode = async (mode: "pocket" | "detailed") => {
    if (user?.preferredMode === mode) return;

    await updateSettings({ preferredMode: mode });

    if (mode === "pocket") {
      window.location.href = "/pocket";
    } else {
      window.location.href = "/dashboard";
    }
  };

  const isPocketMode = user?.preferredMode === "pocket";

  return (
    <div className="inline-flex items-center bg-background-card border border-border rounded-full p-1">
      <button
        onClick={() => handleSwitchMode("detailed")}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
          !isPocketMode
            ? "bg-primary text-white shadow-sm"
            : "text-text-muted hover:text-text-primary"
        )}
      >
        <LayoutDashboard className="w-4 h-4" />
        <span>Dashboard</span>
      </button>
      <button
        onClick={() => handleSwitchMode("pocket")}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
          isPocketMode
            ? "bg-primary text-white shadow-sm"
            : "text-text-muted hover:text-text-primary"
        )}
      >
        <Smartphone className="w-4 h-4" />
        <span>Pocket Pro</span>
        <span className="ml-1 px-2 py-0.5 bg-accent-green/20 text-accent-green text-xs font-semibold rounded-full">
          Mobile
        </span>
      </button>
    </div>
  );
}
