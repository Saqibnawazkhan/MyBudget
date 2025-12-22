import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getMonthRange, formatCurrency, formatDate } from "@/lib/utils";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

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

    // Calculate totals
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    const netSavings = totalIncome - totalExpense;

    // Format month for display
    const [year, monthNum] = month.split("-");
    const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleString(
      "default",
      { month: "long" }
    );

    // Create PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(10, 15, 28);
    doc.rect(0, 0, pageWidth, 40, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("MyBudget", 14, 20);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Monthly Budget Report - ${monthName} ${year}`, 14, 32);

    // Generated date
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 14, 32, {
      align: "right",
    });

    // Summary Section
    let yPos = 55;

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Monthly Summary", 14, yPos);

    yPos += 10;

    // Summary boxes
    const boxWidth = (pageWidth - 42) / 3;

    // Income box
    doc.setFillColor(16, 185, 129);
    doc.roundedRect(14, yPos, boxWidth, 30, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text("Total Income", 14 + boxWidth / 2, yPos + 10, { align: "center" });
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(formatCurrency(totalIncome, user.currency), 14 + boxWidth / 2, yPos + 22, {
      align: "center",
    });

    // Expense box
    doc.setFillColor(239, 68, 68);
    doc.roundedRect(14 + boxWidth + 7, yPos, boxWidth, 30, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Total Expense", 14 + boxWidth * 1.5 + 7, yPos + 10, { align: "center" });
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(
      formatCurrency(totalExpense, user.currency),
      14 + boxWidth * 1.5 + 7,
      yPos + 22,
      { align: "center" }
    );

    // Savings box
    doc.setFillColor(netSavings >= 0 ? 59 : 239, netSavings >= 0 ? 130 : 68, netSavings >= 0 ? 246 : 68);
    doc.roundedRect(14 + boxWidth * 2 + 14, yPos, boxWidth, 30, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Net Savings", 14 + boxWidth * 2.5 + 14, yPos + 10, { align: "center" });
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(
      formatCurrency(netSavings, user.currency),
      14 + boxWidth * 2.5 + 14,
      yPos + 22,
      { align: "center" }
    );

    yPos += 45;

    // Category Breakdown Section
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Expense by Category", 14, yPos);

    yPos += 5;

    const expenseTransactions = transactions.filter((t) => t.type === "expense");
    const categoryMap = new Map<string, { name: string; total: number }>();

    for (const t of expenseTransactions) {
      const categoryName = t.category?.name || "Uncategorized";
      if (categoryMap.has(categoryName)) {
        categoryMap.get(categoryName)!.total += t.amount;
      } else {
        categoryMap.set(categoryName, { name: categoryName, total: t.amount });
      }
    }

    const categoryData = Array.from(categoryMap.values())
      .sort((a, b) => b.total - a.total)
      .map((cat) => [
        cat.name,
        formatCurrency(cat.total, user.currency),
        totalExpense > 0 ? `${Math.round((cat.total / totalExpense) * 1000) / 10}%` : "0%",
      ]);

    if (categoryData.length > 0) {
      autoTable(doc, {
        startY: yPos,
        head: [["Category", "Amount", "% of Total"]],
        body: categoryData,
        theme: "striped",
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [241, 245, 249],
        },
        margin: { left: 14, right: 14 },
      });

      yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
    }

    // Budget vs Actual Section (if budgets exist)
    if (budgets.length > 0) {
      // Check if we need a new page
      if (yPos > 220) {
        doc.addPage();
        yPos = 20;
      }

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Budget vs Actual", 14, yPos);

      yPos += 5;

      const budgetData = budgets.map((budget) => {
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

        return [
          budget.category?.name || "Overall",
          formatCurrency(budget.amount, user.currency),
          formatCurrency(actualSpent, user.currency),
          formatCurrency(difference, user.currency),
          `${percentUsed}%`,
        ];
      });

      autoTable(doc, {
        startY: yPos,
        head: [["Category", "Budget", "Actual", "Difference", "% Used"]],
        body: budgetData,
        theme: "striped",
        headStyles: {
          fillColor: [139, 92, 246],
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [241, 245, 249],
        },
        margin: { left: 14, right: 14 },
      });

      yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
    }

    // Transactions List (new page)
    doc.addPage();

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Transaction Details", 14, 20);

    const transactionData = transactions.slice(0, 50).map((t) => [
      formatDate(t.date),
      t.type.charAt(0).toUpperCase() + t.type.slice(1),
      t.category?.name || "Uncategorized",
      formatCurrency(t.amount, user.currency),
      (t.description || "").substring(0, 30),
    ]);

    autoTable(doc, {
      startY: 25,
      head: [["Date", "Type", "Category", "Amount", "Description"]],
      body: transactionData,
      theme: "striped",
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [241, 245, 249],
      },
      margin: { left: 14, right: 14 },
      styles: {
        fontSize: 9,
      },
    });

    // Footer
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
      doc.text(
        "Generated by MyBudget - AI Budget Planner",
        14,
        doc.internal.pageSize.getHeight() - 10
      );
    }

    // Generate buffer
    const pdfBuffer = doc.output("arraybuffer");

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Budget_Report_${monthName}_${year}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF export error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
