import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Adjust path to your prisma instance
import { verifyToken } from "@/lib/auth";
import { aiExpenseCategorizer } from "@/lib/ai-categorizer"; // You'll need to create this

export async function POST(req: NextRequest) {
  try {
    // Check if request has body
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { status: false, message: "Missing request body" },
        { status: 400 }
      );
    }

    // Verify authentication
    const authResult = await verifyToken(req);

    if (!authResult.success) {
      return authResult.response!; // Return the auth error response
    }

    const userId = authResult.userId!;
    const { description } = body;

    // Validate required fields
    if (!userId || !description) {
      return NextResponse.json(
        { status: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

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

    // AI expense categorization
    const response = await aiExpenseCategorizer(description);

    if (!response.status) {
      return NextResponse.json(
        { status: false, message: response.message },
        { status: 500 }
      );
    }

    if (!response.data) {
      return NextResponse.json(
        { status: false, message: "AI categorizer did not return data" },
        { status: 500 }
      );
    }
    const { amount, category } = response.data;

    // Check if expense exceeds monthly budget
    if (user.monthlyBudget < amount) {
      return NextResponse.json(
        {
          status: false,
          message: "Expense amount exceeds monthly budget",
        },
        { status: 400 }
      );
    }

    // Create new expense
    const expense = await prisma.expense.create({
      data: {
        amount,
        description,
        raw_category: category,
        category,
        user: {
          connect: { id: userId },
        },
      },
    });

    return NextResponse.json(
      {
        status: true,
        message: "Expense created successfully",
        data: expense,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error at api/expenses -> POST:", error);
    return NextResponse.json(
      { status: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
