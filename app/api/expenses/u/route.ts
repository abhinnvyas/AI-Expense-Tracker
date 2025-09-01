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

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { status: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Get user's expenses ordered by creation date (newest first)
    const expenses = await prisma.expense.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (expenses.length === 0) {
      return NextResponse.json(
        { status: false, message: "No expenses found for this user" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: true,
        message: "Expenses fetched successfully",
        data: expenses,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error at api/expenses/u -> GET:", error);
    return NextResponse.json(
      { status: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
