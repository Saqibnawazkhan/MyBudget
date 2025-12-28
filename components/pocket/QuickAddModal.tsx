"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { X, ShoppingBag, Coffee, Car, Home, Utensils, TrendingUp } from "lucide-react";
import { format } from "date-fns";

interface QuickAddModalProps {
  onClose: () => void;
  onSuccess: () => void;
  defaultDate?: Date;
}

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export default function QuickAddModal({
  onClose,
  onSuccess,
  defaultDate = new Date(),
}: QuickAddModalProps) {
  const { user } = useAuthStore();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [type, setType] = useState<"expense" | "income">("expense");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [type]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`/api/categories?type=${type}`);
      const result = await response.json();
      if (result.success) {
        setCategories(result.data);
        if (result.data.length > 0) {
          setSelectedCategory(result.data[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !selectedCategory) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(amount),
          type,
          description,
          categoryId: selectedCategory,
          date: defaultDate.toISOString(),
        }),
      });

      const result = await response.json();
      if (result.success) {
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to add transaction:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      shopping: ShoppingBag,
      coffee: Coffee,
      car: Car,
      home: Home,
      utensils: Utensils,
      trending: TrendingUp,
    };
    return icons[iconName] || ShoppingBag;
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50 max-w-md mx-auto">
      <div className="bg-background-card w-full rounded-t-3xl p-6 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-text-primary">Quick Add</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-background-hover flex items-center justify-center"
          >
            <X className="w-5 h-5 text-text-primary" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type Selector */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType("expense")}
              className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                type === "expense"
                  ? "bg-accent-red text-white"
                  : "bg-background-secondary text-text-muted"
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType("income")}
              className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                type === "income"
                  ? "bg-accent-green text-white"
                  : "bg-background-secondary text-text-muted"
              }`}
            >
              Income
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-text-primary">
                {user?.currency === "USD" ? "$" : user?.currency || "$"}
              </span>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-12 pr-4 py-4 bg-background-secondary rounded-xl text-2xl font-bold text-text-primary placeholder-text-muted/50 border-0 focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What was this for?"
              className="w-full px-4 py-3 bg-background-secondary rounded-xl text-text-primary placeholder-text-muted/50 border-0 focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-text-muted mb-3">
              Category
            </label>
            <div className="grid grid-cols-4 gap-3">
              {categories.map((category) => {
                const IconComponent = getIconComponent(category.icon);
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                      selectedCategory === category.id
                        ? "bg-primary/20 ring-2 ring-primary"
                        : "bg-background-secondary hover:bg-background-hover"
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: `${category.color}20`,
                      }}
                    >
                      <IconComponent
                        className="w-5 h-5"
                        style={{ color: category.color }}
                      />
                    </div>
                    <span className="text-xs font-medium text-text-primary truncate w-full text-center">
                      {category.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Display */}
          <div className="text-center text-sm text-text-muted">
            {format(defaultDate, "MMMM d, yyyy")}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !amount}
            className="w-full py-4 bg-gradient-to-r from-primary to-accent-purple text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-shadow"
          >
            {isSubmitting ? "Adding..." : `Add ${type === "expense" ? "Expense" : "Income"}`}
          </button>
        </form>
      </div>
    </div>
  );
}
