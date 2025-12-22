import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, createToken, setAuthCookie } from "@/lib/auth";
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
      },
    });

    // Create default expense categories
    for (const cat of DEFAULT_EXPENSE_CATEGORIES) {
      await prisma.category.create({
        data: {
          name: cat.name,
          type: "expense",
          color: cat.color,
          icon: cat.icon,
          isDefault: true,
          userId: user.id,
        },
      });
    }

    // Create default income categories
    for (const cat of DEFAULT_INCOME_CATEGORIES) {
      await prisma.category.create({
        data: {
          name: cat.name,
          type: "income",
          color: cat.color,
          icon: cat.icon,
          isDefault: true,
          userId: user.id,
        },
      });
    }

    // Create token
    const token = await createToken({
      userId: user.id,
      email: user.email,
    });

    // Set cookie
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        currency: user.currency,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
