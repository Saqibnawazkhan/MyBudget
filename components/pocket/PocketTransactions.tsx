"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { formatCurrency } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  ShoppingBag,
  Coffee,
  Car,
} from "lucide-react";
import QuickAddModal from "./QuickAddModal";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";

interface DayTransaction {
  date: Date;
  transactions: Array<{
    id: string;
    description: string;
    amount: number;
    time: string;
    categoryColor: string;
    icon: string;
  }>;
  total: number;
}

export default function PocketTransactions() {
  const { user } = useAuthStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dayTransactions, setDayTransactions] = useState<DayTransaction | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const weekDays = ["M", "T", "W", "T", "F", "S", "S"];

  useEffect(() => {
    fetchDayTransactions(selectedDate);
  }, [selectedDate]);

  const fetchDayTransactions = async (date: Date) => {
    try {
      const response = await fetch(
        `/api/pocket/transactions?date=${date.toISOString()}`
      );
      const result = await response.json();
      if (result.success) {
        setDayTransactions(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      shopping: ShoppingBag,
      coffee: Coffee,
      car: Car,
    };
    return icons[iconName] || ShoppingBag;
  };

  const currency = user?.currency || "USD";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pt-4">
        <h1 className="text-2xl font-bold text-text-primary mb-6">Transaction</h1>

        {/* Month Navigator */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          >
            <ChevronLeft className="w-5 h-5 text-text-primary" />
          </button>
          <h2 className="text-lg font-semibold text-text-primary">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          >
            <ChevronRight className="w-5 h-5 text-text-primary" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 mb-6">
          {weekDays.map((day, index) => (
            <div
              key={index}
              className="text-center text-xs font-medium text-text-muted py-2"
            >
              {day}
            </div>
          ))}
          {daysInMonth.map((day, index) => {
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            return (
              <button
                key={index}
                onClick={() => setSelectedDate(day)}
                className={`aspect-square rounded-lg flex items-center justify-center text-sm transition-colors ${
                  isSelected
                    ? "bg-primary text-white font-semibold"
                    : isToday
                    ? "bg-primary/20 text-primary font-medium"
                    : "text-text-primary hover:bg-background-hover"
                }`}
              >
                {format(day, "d")}
              </button>
            );
          })}
        </div>
      </div>

      {/* Today's Summary */}
      <div className="bg-background-secondary rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-text-muted">Today</span>
          <span className="text-sm text-text-muted">Total</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-text-primary">
            {format(selectedDate, "MMMM d")}
          </span>
          <span className="text-2xl font-bold text-accent-red">
            {formatCurrency(dayTransactions?.total || 0, currency)}
          </span>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        {dayTransactions?.transactions && dayTransactions.transactions.length > 0 ? (
          dayTransactions.transactions.map((transaction) => {
            const IconComponent = getIconComponent(transaction.icon);
            return (
              <div
                key={transaction.id}
                className="bg-background-secondary rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${transaction.categoryColor}20` }}
                  >
                    <IconComponent
                      className="w-5 h-5"
                      style={{ color: transaction.categoryColor }}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-text-muted">{transaction.time}</p>
                  </div>
                </div>
                <span className="text-lg font-semibold text-accent-red">
                  {formatCurrency(transaction.amount, currency)}
                </span>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 text-text-muted">
            No transactions for this day
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
      >
        <Plus className="w-6 h-6 text-white" />
      </button>

      {/* Quick Add Modal */}
      {showAddModal && (
        <QuickAddModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchDayTransactions(selectedDate);
          }}
          defaultDate={selectedDate}
        />
      )}
    </div>
  );
}
