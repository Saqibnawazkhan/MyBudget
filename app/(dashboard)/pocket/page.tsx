"use client";

import { useState } from "react";
import PocketReports from "@/components/pocket/PocketReports";
import PocketTransactions from "@/components/pocket/PocketTransactions";
import PocketHistory from "@/components/pocket/PocketHistory";
import { Home, PieChart, Calendar, TrendingUp } from "lucide-react";

type TabType = "reports" | "transactions" | "history";

export default function PocketProPage() {
  const [activeTab, setActiveTab] = useState<TabType>("reports");

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Mobile Container - iPhone style */}
      <div className="max-w-md mx-auto bg-background-card min-h-screen shadow-2xl">
        {/* Content Area */}
        <div className="p-4 pb-24">
          {activeTab === "reports" && <PocketReports />}
          {activeTab === "transactions" && <PocketTransactions />}
          {activeTab === "history" && <PocketHistory />}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-background-card border-t border-border">
          <div className="flex items-center justify-around px-6 py-3">
            <button
              onClick={() => setActiveTab("reports")}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                activeTab === "reports"
                  ? "text-primary"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-xs font-medium">Home</span>
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                activeTab === "history"
                  ? "text-primary"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              <span className="text-xs font-medium">History</span>
            </button>

            <button
              onClick={() => setActiveTab("transactions")}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                activeTab === "transactions"
                  ? "text-primary"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span className="text-xs font-medium">Calendar</span>
            </button>

            <button className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg text-text-muted hover:text-text-primary transition-colors">
              <PieChart className="w-5 h-5" />
              <span className="text-xs font-medium">Stats</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
