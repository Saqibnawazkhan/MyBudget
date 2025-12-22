import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getMonthRange, formatCurrency, formatDate } from "@/lib/utils";
import * as XLSX from "xlsx";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json(
        { success: false, error: "Valid month parameter required (YYYY-MM)" },
        { status: 400 }
      );
    }

    const { start, end } = getMonthRange(month);

    // Get all transactions for the month
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        category: true,
      },
      orderBy: { date: "desc" },
    });

    // Get budgets
    const budgets = await prisma.budget.findMany({
      where: {
        userId: user.id,
        month,
      },
      include: {
        category: true,
      },
    });

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Transactions
    const transactionsData = transactions.map((t) => ({
      Date: formatDate(t.date),
      Type: t.type.charAt(0).toUpperCase() + t.type.slice(1),
      Category: t.category?.name || "Uncategorized",
      Amount: t.amount,
      "Amount (Formatted)": formatCurrency(t.amount, user.currency),
      Description: t.description || "",
      "Payment Method": t.paymentMethod || "",
      Notes: t.notes || "",
    }));

    // Add totals row
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    transactionsData.push({
      Date: "",
      Type: "",
      Category: "",
      Amount: 0,
      "Amount (Formatted)": "",
      Description: "",
      "Payment Method": "",
      Notes: "",
    });
    transactionsData.push({
      Date: "TOTALS",
      Type: "Income",
      Category: "",
      Amount: totalIncome,
      "Amount (Formatted)": formatCurrency(totalIncome, user.currency),
      Description: "",
      "Payment Method": "",
      Notes: "",
    });
    transactionsData.push({
      Date: "",
      Type: "Expense",
      Category: "",
      Amount: totalExpense,
      "Amount (Formatted)": formatCurrency(totalExpense, user.currency),
      Description: "",
      "Payment Method": "",
      Notes: "",
    });
    transactionsData.push({
      Date: "",
      Type: "Net Savings",
      Category: "",
      Amount: totalIncome - totalExpense,
      "Amount (Formatted)": formatCurrency(totalIncome - totalExpense, user.currency),
      Description: "",
      "Payment Method": "",
      Notes: "",
    });

    const transactionsSheet = XLSX.utils.json_to_sheet(transactionsData);

    // Set column widths
    transactionsSheet["!cols"] = [
      { wch: 12 }, // Date
      { wch: 10 }, // Type
      { wch: 20 }, // Category
      { wch: 12 }, // Amount
      { wch: 15 }, // Amount Formatted
      { wch: 30 }, // Description
      { wch: 15 }, // Payment Method
      { wch: 30 }, // Notes
    ];

    XLSX.utils.book_append_sheet(workbook, transactionsSheet, "Transactions");

    // Sheet 2: Category Summary
    const expenseTransactions = transactions.filter((t) => t.type === "expense");
    const categoryMap = new Map<string, { name: string; total: number; count: number }>();

    for (const t of expenseTransactions) {
      const categoryName = t.category?.name || "Uncategorized";
      if (categoryMap.has(categoryName)) {
        const existing = categoryMap.get(categoryName)!;
        existing.total += t.amount;
        existing.count += 1;
      } else {
        categoryMap.set(categoryName, { name: categoryName, total: t.amount, count: 1 });
      }
    }

    const categorySummaryData = Array.from(categoryMap.values())
      .sort((a, b) => b.total - a.total)
      .map((cat) => ({
        Category: cat.name,
        "Total Spent": cat.total,
        "Total Spent (Formatted)": formatCurrency(cat.total, user.currency),
        "% of Total":
          totalExpense > 0
            ? `${Math.round((cat.total / totalExpense) * 1000) / 10}%`
            : "0%",
        "Transaction Count": cat.count,
      }));

    // Add total row
    categorySummaryData.push({
      Category: "TOTAL",
      "Total Spent": totalExpense,
      "Total Spent (Formatted)": formatCurrency(totalExpense, user.currency),
      "% of Total": "100%",
      "Transaction Count": expenseTransactions.length,
    });

    const categorySummarySheet = XLSX.utils.json_to_sheet(categorySummaryData);
    categorySummarySheet["!cols"] = [
      { wch: 25 },
      { wch: 15 },
      { wch: 20 },
      { wch: 12 },
      { wch: 18 },
    ];
    XLSX.utils.book_append_sheet(workbook, categorySummarySheet, "Category Summary");

    // Sheet 3: Budget Summary
    if (budgets.length > 0) {
      const budgetSummaryData = budgets.map((budget) => {
        let actualSpent = 0;
        if (budget.categoryId) {
          actualSpent = expenseTransactions
            .filter((t) => t.categoryId === budget.categoryId)
            .reduce((sum, t) => sum + t.amount, 0);
        } else {
          actualSpent = totalExpense;
        }

        const difference = budget.amount - actualSpent;
        const percentUsed =
          budget.amount > 0 ? Math.round((actualSpent / budget.amount) * 1000) / 10 : 0;

        return {
          Category: budget.category?.name || "Overall",
          Budget: budget.amount,
          "Budget (Formatted)": formatCurrency(budget.amount, user.currency),
          "Actual Spent": actualSpent,
          "Actual Spent (Formatted)": formatCurrency(actualSpent, user.currency),
          Difference: difference,
          "Difference (Formatted)": formatCurrency(difference, user.currency),
          "% Used": `${percentUsed}%`,
          Status: percentUsed > 100 ? "Over Budget" : percentUsed > 80 ? "Warning" : "On Track",
        };
      });

      const budgetSummarySheet = XLSX.utils.json_to_sheet(budgetSummaryData);
      budgetSummarySheet["!cols"] = [
        { wch: 20 },
        { wch: 12 },
        { wch: 15 },
        { wch: 15 },
        { wch: 18 },
        { wch: 12 },
        { wch: 18 },
        { wch: 10 },
        { wch: 12 },
      ];
      XLSX.utils.book_append_sheet(workbook, budgetSummarySheet, "Budget Summary");
    }

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Format month for filename
    const [year, monthNum] = month.split("-");
    const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleString(
      "default",
      { month: "long" }
    );

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="Budget_Report_${monthName}_${year}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Excel export error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
