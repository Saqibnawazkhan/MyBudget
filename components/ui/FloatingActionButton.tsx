"use client";

import { cn } from "@/lib/utils";
import { Plus, X, ArrowUpRight, ArrowDownRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Sub buttons */}
      {isOpen && (
        <>
          <Link
            href="/transactions?action=add&type=income"
            className="flex items-center gap-2 px-4 py-2.5 bg-accent-green text-white rounded-full shadow-lg hover:shadow-xl transition-all animate-fade-in-up"
            style={{ animationDelay: "0ms" }}
            onClick={() => setIsOpen(false)}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span className="text-sm font-medium">Income</span>
          </Link>
          <Link
            href="/transactions?action=add&type=expense"
            className="flex items-center gap-2 px-4 py-2.5 bg-accent-red text-white rounded-full shadow-lg hover:shadow-xl transition-all animate-fade-in-up"
            style={{ animationDelay: "50ms" }}
            onClick={() => setIsOpen(false)}
          >
            <ArrowDownRight className="w-4 h-4" />
            <span className="text-sm font-medium">Expense</span>
          </Link>
        </>
      )}

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center",
          isOpen
            ? "bg-background-card border border-border text-text-primary rotate-45"
            : "bg-primary text-white hover:bg-primary-hover"
        )}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </button>
    </div>
  );
}
