"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import PocketReports from "@/components/pocket/PocketReports";
import PocketTransactions from "@/components/pocket/PocketTransactions";
import PocketHistory from "@/components/pocket/PocketHistory";
import { Home, PieChart, Calendar, TrendingUp, LayoutDashboard, LogOut, Menu, X } from "lucide-react";

type TabType = "reports" | "transactions" | "history";

export default function PocketProPage() {
  const router = useRouter();
  const { user, logout, updateSettings } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>("reports");
  const [showMenu, setShowMenu] = useState(false);

  const handleSwitchToDetailed = async () => {
    await updateSettings({ preferredMode: "detailed" });
    router.push("/dashboard");
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Container - Full Screen */}
      <div className="min-h-screen bg-background relative">
        {/* Mobile Header */}
        <div className="sticky top-0 z-50 bg-background-card border-b border-border">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <div>
                <h1 className="text-sm font-bold text-text-primary">Pocket Pro</h1>
                <p className="text-xs text-text-muted">{user?.name?.split(" ")[0] || "User"}</p>
              </div>
            </div>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-background-hover rounded-lg transition-colors"
            >
              {showMenu ? (
                <X className="w-5 h-5 text-text-primary" />
              ) : (
                <Menu className="w-5 h-5 text-text-primary" />
              )}
            </button>
          </div>

          {/* Dropdown Menu */}
          {showMenu && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-black/20 z-40"
                onClick={() => setShowMenu(false)}
              />
              {/* Menu */}
              <div className="absolute right-4 top-14 bg-background-card border border-border rounded-xl shadow-2xl w-64 overflow-hidden animate-fade-in z-50">
                <button
                  onClick={() => {
                    handleSwitchToDetailed();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-background-hover text-left transition-colors"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <LayoutDashboard className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">Switch to Detailed</p>
                    <p className="text-xs text-text-muted">Full dashboard view</p>
                  </div>
                </button>
                <div className="border-t border-border" />
                <button
                  onClick={() => {
                    handleLogout();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-background-hover text-left transition-colors"
                >
                  <div className="w-10 h-10 bg-accent-red/10 rounded-lg flex items-center justify-center">
                    <LogOut className="w-5 h-5 text-accent-red" />
                  </div>
                  <p className="text-sm font-semibold text-accent-red">Logout</p>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Content Area */}
        <div className="pb-20">
          {activeTab === "reports" && <PocketReports />}
          {activeTab === "transactions" && <PocketTransactions />}
          {activeTab === "history" && <PocketHistory />}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-background-card border-t border-border safe-area-bottom">
          <div className="flex items-center justify-around px-4 py-2 max-w-md mx-auto">
            <button
              onClick={() => {
                setActiveTab("reports");
                setShowMenu(false);
              }}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                activeTab === "reports"
                  ? "text-primary bg-primary/10"
                  : "text-text-muted hover:text-text-primary hover:bg-background-hover"
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-xs font-medium">Home</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("history");
                setShowMenu(false);
              }}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                activeTab === "history"
                  ? "text-primary bg-primary/10"
                  : "text-text-muted hover:text-text-primary hover:bg-background-hover"
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              <span className="text-xs font-medium">History</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("transactions");
                setShowMenu(false);
              }}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                activeTab === "transactions"
                  ? "text-primary bg-primary/10"
                  : "text-text-muted hover:text-text-primary hover:bg-background-hover"
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span className="text-xs font-medium">Calendar</span>
            </button>

            <button
              onClick={() => setShowMenu(false)}
              className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-background-hover transition-all"
            >
              <PieChart className="w-5 h-5" />
              <span className="text-xs font-medium">Stats</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
