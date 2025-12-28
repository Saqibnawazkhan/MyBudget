"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { formatCurrency } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface MonthHistory {
  month: string;
  totalAmount: number;
  transactionCount: number;
  expanded?: boolean;
}

export default function PocketHistory() {
  const { user } = useAuthStore();
  const [history, setHistory] = useState<MonthHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch("/api/pocket/history");
      const result = await response.json();
      if (result.success) {
        setHistory(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpand = (index: number) => {
    setHistory((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, expanded: !item.expanded } : item
      )
    );
  };

  const currency = user?.currency || "USD";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-text-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pt-4">
        <h1 className="text-2xl font-bold text-text-primary mb-6">History</h1>
      </div>

      {/* History List */}
      <div className="space-y-3">
        {history.length > 0 ? (
          history.map((item, index) => (
            <div
              key={index}
              className="bg-background-secondary rounded-xl overflow-hidden"
            >
              <button
                onClick={() => toggleExpand(index)}
                className="w-full p-4 flex items-center justify-between hover:bg-background-hover transition-colors"
              >
                <div>
                  <p className="font-semibold text-text-primary text-left">
                    {item.month}
                  </p>
                  <p className="text-xs text-text-muted">
                    {item.transactionCount} transactions
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-bold text-text-primary">
                    {formatCurrency(item.totalAmount, currency)}
                  </p>
                  <ChevronDown
                    className={`w-5 h-5 text-text-muted transition-transform ${
                      item.expanded ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-text-muted">
            No transaction history yet
          </div>
        )}
      </div>
    </div>
  );
}
