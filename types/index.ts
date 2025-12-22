export interface User {
  id: string;
  email: string;
  name: string | null;
  currency: string;
  timezone: string;
  monthStartDay: number;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
  icon: string;
  isDefault: boolean;
  parentId: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  subcategories?: Category[];
  parent?: Category | null;
}

export interface Transaction {
  id: string;
  amount: number;
  type: "income" | "expense";
  description: string | null;
  date: Date;
  paymentMethod: string | null;
  notes: string | null;
  tags: string | null;
  isRecurring: boolean;
  receiptUrl: string | null;
  userId: string;
  categoryId: string | null;
  category?: Category | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Budget {
  id: string;
  amount: number;
  month: string;
  categoryId: string | null;
  category?: Category | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  spent?: number;
  remaining?: number;
  percentUsed?: number;
}

export interface MonthlyReport {
  month: string;
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  categoryBreakdown: CategoryBreakdown[];
  budgetSummary: BudgetSummary[];
  dailyExpenses: DailyExpense[];
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  total: number;
  percentage: number;
  transactionCount: number;
}

export interface BudgetSummary {
  categoryId: string | null;
  categoryName: string;
  budgetAmount: number;
  actualSpent: number;
  difference: number;
  percentUsed: number;
}

export interface DailyExpense {
  date: string;
  amount: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export type TransactionType = "income" | "expense";
export type PaymentMethod = "cash" | "card" | "bank" | "other";
