import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// GET all categories
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
    const type = searchParams.get("type"); // "income" or "expense"

    const where: { userId: string; type?: string } = { userId: user.id };
    if (type) {
      where.type = type;
    }

    const categories = await prisma.category.findMany({
      where,
      include: {
        subcategories: true,
        parent: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST create new category
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, type, color, icon, parentId } = body;

    if (!name || !type) {
      return NextResponse.json(
        { success: false, error: "Name and type are required" },
        { status: 400 }
      );
    }

    if (type !== "income" && type !== "expense") {
      return NextResponse.json(
        { success: false, error: "Type must be 'income' or 'expense'" },
        { status: 400 }
      );
    }

    // Check if category with same name and type exists
    const existing = await prisma.category.findFirst({
      where: {
        userId: user.id,
        name,
        type,
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Category with this name already exists" },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        type,
        color: color || "#3b82f6",
        icon: icon || "tag",
        parentId: parentId || null,
        userId: user.id,
        isDefault: false,
      },
      include: {
        subcategories: true,
        parent: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Create category error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
