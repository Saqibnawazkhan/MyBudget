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
} from "lucide-react";
import type { Transaction, Category } from "@/types";

export default function TransactionsPage() {
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(
    null
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

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

    // Check URL params for action
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

  const currency = user?.currency || "USD";
  const filteredCategories = categories.filter(
    (cat) => cat.type === formData.type
  );

  return (
    <div className="py-6">
      <div className="animate-fade-in-up">
        <Header
          title="Transactions"
          subtitle="Track and manage your income and expenses"
        />
      </div>

      {/* Filters */}
      <Card className="mt-6 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <Select
            options={[
              { value: "", label: "All Types" },
              { value: "income", label: "Income" },
              { value: "expense", label: "Expense" },
            ]}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          />
          <Select
            options={[
              { value: "", label: "All Categories" },
              ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
            ]}
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          />
          <Input
            type="date"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
            className="w-40"
          />
          <Input
            type="date"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
            className="w-40"
          />
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>
      </Card>

      {/* Transactions List */}
      <Card className="mt-6 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
        {isLoading ? (
          <SkeletonList items={5} />
        ) : transactions.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No transactions found"
            description="Start tracking your expenses and income to see them here"
            actionLabel="Add Transaction"
            onAction={() => setShowModal(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-text-muted uppercase">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-text-muted uppercase">
                    Description
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-text-muted uppercase">
                    Category
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-text-muted uppercase">
                    Type
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-text-muted uppercase">
                    Amount
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-text-muted uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction, index) => (
                  <tr
                    key={transaction.id}
                    className="border-b border-border hover:bg-background-hover transition-all duration-300 animate-fade-in-up"
                    style={{ animationDelay: `${300 + index * 30}ms` }}
                  >
                    <td className="py-4 px-4">
                      <span className="text-sm text-text-primary">
                        {formatDate(transaction.date)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg transition-transform hover:scale-110 ${
                            transaction.type === "income"
                              ? "bg-accent-green/10"
                              : "bg-accent-red/10"
                          }`}
                        >
                          {transaction.type === "income" ? (
                            <ArrowUpRight className="w-4 h-4 text-accent-green" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-accent-red" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary">
                            {transaction.description || "No description"}
                          </p>
                          {transaction.notes && (
                            <p className="text-xs text-text-muted truncate max-w-xs">
                              {transaction.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {transaction.category ? (
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: transaction.category.color,
                            }}
                          />
                          <span className="text-sm text-text-secondary">
                            {transaction.category.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-text-muted">
                          Uncategorized
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <Badge
                        variant={
                          transaction.type === "income" ? "income" : "expense"
                        }
                      >
                        {transaction.type}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span
                        className={`text-sm font-semibold ${
                          transaction.type === "income"
                            ? "text-accent-green"
                            : "text-accent-red"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount, currency)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(transaction)}
                          className="p-2 text-text-muted hover:text-text-primary hover:bg-background-hover rounded-lg transition-all duration-200 hover:scale-110"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(transaction.id)}
                          className="p-2 text-text-muted hover:text-accent-red hover:bg-accent-red/10 rounded-lg transition-all duration-200 hover:scale-110"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
        title={editingTransaction ? "Edit Transaction" : "Add Transaction"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-accent-red/10 border border-accent-red/20 rounded-lg text-accent-red text-sm">
              {formError}
            </div>
          )}

          {/* Type Toggle */}
          <div className="flex gap-2 p-1 bg-background-secondary rounded-lg">
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, type: "expense", categoryId: "" }))}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                formData.type === "expense"
                  ? "bg-accent-red text-white"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, type: "income", categoryId: "" }))}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                formData.type === "income"
                  ? "bg-accent-green text-white"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Income
            </button>
          </div>

          <Input
            type="number"
            label="Amount"
            placeholder="0.00"
            value={formData.amount}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, amount: e.target.value }))
            }
            required
          />

          <Select
            label="Category"
            options={filteredCategories.map((cat) => ({
              value: cat.id,
              label: cat.name,
            }))}
            value={formData.categoryId}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, categoryId: e.target.value }))
            }
            placeholder="Select category"
          />

          <Input
            type="date"
            label="Date"
            value={formData.date}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, date: e.target.value }))
            }
            required
          />

          <Input
            label="Description"
            placeholder="What was this for?"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
          />

          <Select
            label="Payment Method"
            options={PAYMENT_METHODS}
            value={formData.paymentMethod}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, paymentMethod: e.target.value }))
            }
            placeholder="Select method"
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
              {editingTransaction ? "Update" : "Add"} Transaction
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
          Are you sure you want to delete this transaction? This action cannot be
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
