import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, currency, timezone, monthStartDay, preferredMode } = body;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name !== undefined ? name : user.name,
        currency: currency !== undefined ? currency : user.currency,
        timezone: timezone !== undefined ? timezone : user.timezone,
        monthStartDay: monthStartDay !== undefined ? monthStartDay : user.monthStartDay,
        preferredMode: preferredMode !== undefined ? preferredMode : user.preferredMode,
      },
      select: {
        id: true,
        email: true,
        name: true,
        currency: true,
        timezone: true,
        monthStartDay: true,
        preferredMode: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Add PATCH method for partial updates
export async function PATCH(request: NextRequest) {
  return PUT(request);
}
