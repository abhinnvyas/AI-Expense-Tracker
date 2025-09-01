import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Adjust path to your prisma instance
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyToken(req);

    if (!authResult.success) {
      return authResult.response!; // Return the auth error response
    }

    const userId = authResult.userId!;

    // Get user with their budget and expenses
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        monthlyBudget: true,
        expenses: {
          select: { amount: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { status: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Calculate total spent
    const totalExpenses = user.expenses.reduce((sum, e) => sum + e.amount, 0);

    // Available balance
    const availableBalance = user.monthlyBudget - totalExpenses;

    return NextResponse.json(
      {
        status: true,
        message: "Available balance fetched successfully",
        data: {
          availableBalance,
          totalExpenses,
          budget: user.monthlyBudget,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error at api/users/av/balance -> GET:", error);
    return NextResponse.json(
      { status: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
