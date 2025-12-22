"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { Card, Button, Input, Select, Modal, ProgressBar } from "@/components/ui";
import Header from "@/components/layout/Header";
import { formatCurrency, getMonthKey } from "@/lib/utils";
import { Plus, Edit2, Trash2, AlertCircle, CheckCircle } from "lucide-react";
import type { Budget, Category } from "@/types";

interface BudgetWithSpent extends Budget {
  spent: number;
  remaining: number;
  percentUsed: number;
}

export default function BudgetsPage() {
  const { user } = useAuthStore();
  const [budgets, setBudgets] = useState<BudgetWithSpent[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(getMonthKey(new Date()));
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetWithSpent | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    amount: "",
    categoryId: "",
  });
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchBudgets = async () => {
    try {
      const response = await fetch(`/api/budgets?month=${selectedMonth}`);
      const data = await response.json();
      if (data.success) {
        setBudgets(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch budgets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories?type=expense");
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [selectedMonth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSaving(true);

    try {
      const url = editingBudget
        ? `/api/budgets/${editingBudget.id}`
        : "/api/budgets";
      const method = editingBudget ? "PUT" : "POST";

      const body = editingBudget
        ? { amount: formData.amount }
        : {
            amount: formData.amount,
            month: selectedMonth,
            categoryId: formData.categoryId || null,
          };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        setShowModal(false);
        resetForm();
        fetchBudgets();
      } else {
        setFormError(data.error || "Failed to save budget");
      }
    } catch {
      setFormError("Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/budgets/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        fetchBudgets();
      }
    } catch (error) {
      console.error("Failed to delete budget:", error);
    }
    setShowDeleteConfirm(null);
  };

  const handleEdit = (budget: BudgetWithSpent) => {
    setEditingBudget(budget);
    setFormData({
      amount: budget.amount.toString(),
      categoryId: budget.categoryId || "",
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      amount: "",
      categoryId: "",
    });
    setEditingBudget(null);
    setFormError("");
  };

  // Generate month options (last 12 months + next 6 months)
  const monthOptions = [];
  const now = new Date();
  for (let i = -6; i <= 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = getMonthKey(date);
    const label = date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    monthOptions.push({ value: key, label });
  }

  // Get available categories (not yet budgeted)
  const budgetedCategoryIds = budgets
    .filter((b) => b.categoryId)
    .map((b) => b.categoryId);
  const availableCategories = categories.filter(
    (cat) => !budgetedCategoryIds.includes(cat.id)
  );

  const currency = user?.currency || "USD";

  // Calculate totals
  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = totalBudget - totalSpent;

  return (
    <div className="py-6">
      <Header
        title="Budgets"
        subtitle="Set spending limits and track your progress"
      />

      {/* Month Selector & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        <Card className="lg:col-span-1">
          <h3 className="text-sm font-semibold text-text-muted uppercase mb-4">
            Select Month
          </h3>
          <Select
            options={monthOptions}
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
          <Button
            className="w-full mt-4"
            onClick={() => setShowModal(true)}
            disabled={availableCategories.length === 0 && !editingBudget}
          >
            <Plus className="w-4 h-4" />
            Add Budget
          </Button>
        </Card>

        {/* Summary Cards */}
        <Card className="bg-gradient-to-br from-accent-purple/10 to-transparent">
          <p className="text-text-secondary text-sm">Total Budget</p>
          <p className="text-2xl font-bold text-text-primary mt-2">
            {formatCurrency(totalBudget, currency)}
          </p>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-transparent">
          <p className="text-text-secondary text-sm">Total Spent</p>
          <p className="text-2xl font-bold text-text-primary mt-2">
            {formatCurrency(totalSpent, currency)}
          </p>
          <p className="text-xs text-text-muted mt-1">
            {totalBudget > 0
              ? `${Math.round((totalSpent / totalBudget) * 100)}% of budget`
              : "No budget set"}
          </p>
        </Card>

        <Card
          className={`bg-gradient-to-br ${
            totalRemaining >= 0
              ? "from-accent-green/10"
              : "from-accent-red/10"
          } to-transparent`}
        >
          <p className="text-text-secondary text-sm">Remaining</p>
          <p
            className={`text-2xl font-bold mt-2 ${
              totalRemaining >= 0 ? "text-accent-green" : "text-accent-red"
            }`}
          >
            {formatCurrency(totalRemaining, currency)}
          </p>
          {totalRemaining < 0 && (
            <p className="text-xs text-accent-red mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Over budget
            </p>
          )}
        </Card>
      </div>

      {/* Budget List */}
      <Card className="mt-6">
        <h3 className="text-lg font-semibold text-text-primary mb-6">
          Budget Breakdown
        </h3>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 bg-background-secondary rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : budgets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-muted mb-4">
              No budgets set for this month
            </p>
            <Button onClick={() => setShowModal(true)}>
              <Plus className="w-4 h-4" />
              Set Your First Budget
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {budgets.map((budget) => (
              <div
                key={budget.id}
                className="p-4 bg-background-secondary rounded-xl"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: budget.category?.color || "#8b5cf6",
                      }}
                    />
                    <span className="font-medium text-text-primary">
                      {budget.category?.name || "Overall Budget"}
                    </span>
                    {budget.percentUsed >= 100 ? (
                      <span className="flex items-center gap-1 text-xs text-accent-red">
                        <AlertCircle className="w-3 h-3" />
                        Over budget
                      </span>
                    ) : budget.percentUsed >= 80 ? (
                      <span className="flex items-center gap-1 text-xs text-yellow-500">
                        <AlertCircle className="w-3 h-3" />
                        Warning
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-accent-green">
                        <CheckCircle className="w-3 h-3" />
                        On track
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(budget)}
                      className="p-2 text-text-muted hover:text-text-primary hover:bg-background-hover rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(budget.id)}
                      className="p-2 text-text-muted hover:text-accent-red hover:bg-accent-red/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="text-text-secondary">
                    {formatCurrency(budget.spent, currency)} of{" "}
                    {formatCurrency(budget.amount, currency)}
                  </span>
                  <span
                    className={`font-medium ${
                      budget.remaining >= 0
                        ? "text-accent-green"
                        : "text-accent-red"
                    }`}
                  >
                    {budget.remaining >= 0
                      ? `${formatCurrency(budget.remaining, currency)} left`
                      : `${formatCurrency(
                          Math.abs(budget.remaining),
                          currency
                        )} over`}
                  </span>
                </div>

                <ProgressBar
                  value={budget.spent}
                  max={budget.amount}
                  color={budget.category?.color || "#8b5cf6"}
                />
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingBudget ? "Edit Budget" : "Add Budget"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-accent-red/10 border border-accent-red/20 rounded-lg text-accent-red text-sm">
              {formError}
            </div>
          )}

          {!editingBudget && (
            <Select
              label="Category"
              options={[
                { value: "", label: "Overall Budget" },
                ...availableCategories.map((cat) => ({
                  value: cat.id,
                  label: cat.name,
                })),
              ]}
              value={formData.categoryId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, categoryId: e.target.value }))
              }
            />
          )}

          <Input
            type="number"
            label="Budget Amount"
            placeholder="0.00"
            value={formData.amount}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, amount: e.target.value }))
            }
            required
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" isLoading={isSaving}>
              {editingBudget ? "Update" : "Create"} Budget
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title="Delete Budget"
        size="sm"
      >
        <p className="text-text-secondary mb-6">
          Are you sure you want to delete this budget? This action cannot be
          undone.
        </p>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => setShowDeleteConfirm(null)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={() => showDeleteConfirm && handleDelete(showDeleteConfirm)}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
