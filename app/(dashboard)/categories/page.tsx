"use client";

import { useEffect, useState } from "react";
import { Card, Button, Input, Select, Modal } from "@/components/ui";
import Header from "@/components/layout/Header";
import { CATEGORY_COLORS } from "@/lib/utils";
import { Plus, Edit2, Trash2, Tag } from "lucide-react";
import type { Category } from "@/types";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"expense" | "income">("expense");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    type: "expense" as "income" | "expense",
    color: CATEGORY_COLORS[0],
  });
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSaving(true);

    try {
      const url = editingCategory
        ? `/api/categories/${editingCategory.id}`
        : "/api/categories";
      const method = editingCategory ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setShowModal(false);
        resetForm();
        fetchCategories();
      } else {
        setFormError(data.error || "Failed to save category");
      }
    } catch {
      setFormError("Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        fetchCategories();
      }
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
    setShowDeleteConfirm(null);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type as "income" | "expense",
      color: category.color,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: activeTab,
      color: CATEGORY_COLORS[0],
    });
    setEditingCategory(null);
    setFormError("");
  };

  const filteredCategories = categories.filter((cat) => cat.type === activeTab);
  const expenseCount = categories.filter((cat) => cat.type === "expense").length;
  const incomeCount = categories.filter((cat) => cat.type === "income").length;

  return (
    <div className="py-6">
      <Header
        title="Categories"
        subtitle="Organize your transactions with custom categories"
      />

      {/* Tabs & Add Button */}
      <div className="flex items-center justify-between mt-6 mb-6">
        <div className="flex gap-2 p-1 bg-background-card border border-border rounded-lg">
          <button
            onClick={() => setActiveTab("expense")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "expense"
                ? "bg-accent-red text-white"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Expense ({expenseCount})
          </button>
          <button
            onClick={() => setActiveTab("income")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "income"
                ? "bg-accent-green text-white"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Income ({incomeCount})
          </button>
        </div>

        <Button
          onClick={() => {
            resetForm();
            setFormData((prev) => ({ ...prev, type: activeTab }));
            setShowModal(true);
          }}
        >
          <Plus className="w-4 h-4" />
          Add Category
        </Button>
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-24 bg-background-card border border-border rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : filteredCategories.length === 0 ? (
        <Card className="text-center py-12">
          <Tag className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <p className="text-text-muted mb-4">
            No {activeTab} categories yet
          </p>
          <Button
            onClick={() => {
              resetForm();
              setFormData((prev) => ({ ...prev, type: activeTab }));
              setShowModal(true);
            }}
          >
            <Plus className="w-4 h-4" />
            Create Your First Category
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((category) => (
            <Card
              key={category.id}
              className="flex items-center justify-between hover:border-border-light transition-colors"
              hover
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                </div>
                <div>
                  <h3 className="font-medium text-text-primary">
                    {category.name}
                  </h3>
                  {category.isDefault && (
                    <span className="text-xs text-text-muted">Default</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="p-2 text-text-muted hover:text-text-primary hover:bg-background-hover rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(category.id)}
                  className="p-2 text-text-muted hover:text-accent-red hover:bg-accent-red/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingCategory ? "Edit Category" : "Add Category"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-accent-red/10 border border-accent-red/20 rounded-lg text-accent-red text-sm">
              {formError}
            </div>
          )}

          <Input
            label="Category Name"
            placeholder="e.g., Groceries, Rent, Salary"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            required
          />

          {!editingCategory && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Type
              </label>
              <div className="flex gap-2 p-1 bg-background-secondary rounded-lg">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, type: "expense" }))
                  }
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
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, type: "income" }))
                  }
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    formData.type === "income"
                      ? "bg-accent-green text-white"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Income
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-3">
              Color
            </label>
            <div className="flex flex-wrap gap-3">
              {CATEGORY_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, color }))}
                  className={`w-10 h-10 rounded-lg transition-all ${
                    formData.color === color
                      ? "ring-2 ring-offset-2 ring-offset-background-card ring-white scale-110"
                      : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

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
              {editingCategory ? "Update" : "Create"} Category
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title="Delete Category"
        size="sm"
      >
        <p className="text-text-secondary mb-6">
          Are you sure you want to delete this category? Transactions using this
          category will become uncategorized.
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
