"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { Card, Button, Input, Select, Modal, Badge, EmptyState, SkeletonList } from "@/components/ui";
import Header from "@/components/layout/Header";
import { formatCurrency, formatDate, PAYMENT_METHODS } from "@/lib/utils";
import {
  Plus,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Edit2,
  Trash2,
  Receipt,
  Filter,
  X,
  ChevronDown,
} from "lucide-react";
import type { Transaction, Category } from "@/types";

export default function TransactionsPage() {
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    amount: "",
    type: "expense" as "income" | "expense",
    categoryId: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    paymentMethod: "",
    notes: "",
  });
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Check if any filter is active
  const hasActiveFilters = filterType || filterCategory || filterStartDate || filterEndDate;

  const fetchTransactions = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterType) params.append("type", filterType);
      if (filterCategory) params.append("categoryId", filterCategory);
      if (filterStartDate) params.append("startDate", filterStartDate);
      if (filterEndDate) params.append("endDate", filterEndDate);
      if (searchTerm) params.append("search", searchTerm);

      const response = await fetch(`/api/transactions?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setTransactions(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filterType, filterCategory, filterStartDate, filterEndDate, searchTerm]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
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
    fetchTransactions();

    const action = searchParams.get("action");
    const type = searchParams.get("type");
    if (action === "add") {
      setShowModal(true);
      if (type === "income" || type === "expense") {
        setFormData((prev) => ({ ...prev, type }));
      }
    }
  }, [searchParams, fetchTransactions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSaving(true);

    try {
      const url = editingTransaction
        ? `/api/transactions/${editingTransaction.id}`
        : "/api/transactions";
      const method = editingTransaction ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setShowModal(false);
        resetForm();
        fetchTransactions();
      } else {
        setFormError(data.error || "Failed to save transaction");
      }
    } catch {
      setFormError("Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        fetchTransactions();
      }
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    }
    setShowDeleteConfirm(null);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      amount: transaction.amount.toString(),
      type: transaction.type as "income" | "expense",
      categoryId: transaction.categoryId || "",
      date: new Date(transaction.date).toISOString().split("T")[0],
      description: transaction.description || "",
      paymentMethod: transaction.paymentMethod || "",
      notes: transaction.notes || "",
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      amount: "",
      type: "expense",
      categoryId: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
      paymentMethod: "",
      notes: "",
    });
    setEditingTransaction(null);
    setFormError("");
  };

  const clearFilters = () => {
    setFilterType("");
    setFilterCategory("");
    setFilterStartDate("");
    setFilterEndDate("");
  };

  const currency = user?.currency || "USD";
  const filteredCategories = categories.filter((cat) => cat.type === formData.type);

  return (
    <div className="py-6">
      {/* Clean Header with Add Button */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <Header
          title="Transactions"
          subtitle="Track your income and expenses"
        />
        <Button onClick={() => setShowModal(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add</span>
        </Button>
      </div>

      {/* Simple Search Bar with Filter Toggle */}
      <div className="mt-6 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-background-card border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
              hasActiveFilters
                ? "bg-primary/10 border-primary text-primary"
                : "bg-background-card border-border text-text-secondary hover:border-border-light"
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <span className="w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                {[filterType, filterCategory, filterStartDate, filterEndDate].filter(Boolean).length}
              </span>
            )}
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Collapsible Filters */}
        {showFilters && (
          <Card className="mt-3 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-text-primary">Filter by</span>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Clear all
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Select
                label="Type"
                options={[
                  { value: "", label: "All" },
                  { value: "income", label: "Income" },
                  { value: "expense", label: "Expense" },
                ]}
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              />
              <Select
                label="Category"
                options={[
                  { value: "", label: "All" },
                  ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
                ]}
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              />
              <Input
                type="date"
                label="From"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
              />
              <Input
                type="date"
                label="To"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
              />
            </div>
          </Card>
        )}
      </div>

      {/* Transactions List - Card Style for Mobile */}
      <div className="mt-6 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
        {isLoading ? (
          <SkeletonList items={5} />
        ) : transactions.length === 0 ? (
          <Card>
            <EmptyState
              icon={Receipt}
              title="No transactions found"
              description="Start tracking your expenses and income"
              actionLabel="Add Transaction"
              onAction={() => setShowModal(true)}
            />
          </Card>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction, index) => (
              <div
                key={transaction.id}
                className="bg-background-card border border-border rounded-xl p-4 hover:border-border-light transition-all duration-200 animate-fade-in-up"
                style={{ animationDelay: `${200 + index * 30}ms` }}
              >
                <div className="flex items-center justify-between">
                  {/* Left: Icon + Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className={`p-2.5 rounded-xl shrink-0 ${
                        transaction.type === "income"
                          ? "bg-accent-green/10"
                          : "bg-accent-red/10"
                      }`}
                    >
                      {transaction.type === "income" ? (
                        <ArrowUpRight className="w-5 h-5 text-accent-green" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5 text-accent-red" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-text-primary truncate">
                        {transaction.description || transaction.category?.name || "Transaction"}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-text-muted">
                          {formatDate(transaction.date)}
                        </span>
                        {transaction.category && (
                          <>
                            <span className="text-text-muted">•</span>
                            <span className="text-xs text-text-secondary flex items-center gap-1">
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: transaction.category.color }}
                              />
                              {transaction.category.name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount + Actions */}
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-semibold ${
                        transaction.type === "income"
                          ? "text-accent-green"
                          : "text-accent-red"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount, currency)}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(transaction)}
                        className="p-2 text-text-muted hover:text-text-primary hover:bg-background-hover rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(transaction.id)}
                        className="p-2 text-text-muted hover:text-accent-red hover:bg-accent-red/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Simplified Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingTransaction ? "Edit Transaction" : "Add Transaction"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {formError && (
            <div className="p-3 bg-accent-red/10 border border-accent-red/20 rounded-lg text-accent-red text-sm">
              {formError}
            </div>
          )}

          {/* Type Toggle - Larger and more prominent */}
          <div className="flex gap-2 p-1.5 bg-background-secondary rounded-xl">
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, type: "expense", categoryId: "" }))}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                formData.type === "expense"
                  ? "bg-accent-red text-white shadow-sm"
                  : "text-text-secondary hover:text-text-primary hover:bg-background-hover"
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, type: "income", categoryId: "" }))}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                formData.type === "income"
                  ? "bg-accent-green text-white shadow-sm"
                  : "text-text-secondary hover:text-text-primary hover:bg-background-hover"
              }`}
            >
              Income
            </button>
          </div>

          {/* Amount - Large and prominent */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-text-muted">
                {currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "INR" ? "₹" : "$"}
              </span>
              <input
                type="number"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                className="w-full pl-12 pr-4 py-4 text-2xl font-semibold bg-background-secondary border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                required
              />
            </div>
          </div>

          {/* Two column layout for smaller fields */}
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category"
              options={filteredCategories.map((cat) => ({
                value: cat.id,
                label: cat.name,
              }))}
              value={formData.categoryId}
              onChange={(e) => setFormData((prev) => ({ ...prev, categoryId: e.target.value }))}
              placeholder="Select"
            />
            <Input
              type="date"
              label="Date"
              value={formData.date}
              onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>

          <Input
            label="Description"
            placeholder="What was this for?"
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          />

          <Select
            label="Payment Method (Optional)"
            options={PAYMENT_METHODS}
            value={formData.paymentMethod}
            onChange={(e) => setFormData((prev) => ({ ...prev, paymentMethod: e.target.value }))}
            placeholder="Select"
          />

          <div className="flex gap-3 pt-2">
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
              {editingTransaction ? "Update" : "Add"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title="Delete Transaction"
        size="sm"
      >
        <p className="text-text-secondary mb-6">
          Are you sure you want to delete this transaction? This action cannot be undone.
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
