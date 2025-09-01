import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Adjust path to your prisma instance
import { verifyToken } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const authResult = await verifyToken(req);

    if (!authResult.success) {
      return authResult.response!; // Return the auth error response
    }

    const awaitedParams = await params;
    // Check if params exist
    if (!awaitedParams || !awaitedParams.id) {
      return NextResponse.json(
        { status: false, message: "Missing Request Parameters" },
        { status: 400 }
      );
    }

    const expenseId = awaitedParams.id;

    // Validate expense ID
    if (!expenseId) {
      return NextResponse.json(
        { status: false, message: "Expense Id is required" },
        { status: 400 }
      );
    }

    // Check if expense exists
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!expense) {
      return NextResponse.json(
        { status: false, message: "Expense not found" },
        { status: 404 }
      );
    }

    // Delete the expense
    await prisma.expense.delete({
      where: { id: expenseId },
    });

    return NextResponse.json(
      {
        status: true,
        message: "Expense deleted successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error at api/expenses/[id] -> DELETE:", error);
    return NextResponse.json(
      { status: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const authResult = await verifyToken(req);

    if (!authResult.success) {
      return authResult.response!; // Return the auth error response
    }

    // Check if params exist
    const awaitedParams = await params;
    if (!awaitedParams || !awaitedParams.id) {
      return NextResponse.json(
        { status: false, message: "Missing Request Parameters" },
        { status: 400 }
      );
    }

    const expenseId = awaitedParams.id;

    // Validate expense ID
    if (!expenseId) {
      return NextResponse.json(
        { status: false, message: "Expense Id is required" },
        { status: 400 }
      );
    }

    // Check if request has body
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { status: false, message: "Missing request body" },
        { status: 400 }
      );
    }

    const { amount, category } = body;

    // Validate at least one field is provided
    if (!amount && !category) {
      return NextResponse.json(
        {
          status: false,
          message:
            "At least one field (amount, description, category) is required",
        },
        { status: 400 }
      );
    }

    // Validate amount if provided
    if (amount && (typeof amount !== "number" || isNaN(amount))) {
      return NextResponse.json(
        { status: false, message: "Amount must be a number" },
        { status: 400 }
      );
    }

    // Check if expense exists
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!expense) {
      return NextResponse.json(
        { status: false, message: "Expense not found" },
        { status: 404 }
      );
    }

    // Update the expense
    const updatedExpense = await prisma.expense.update({
      where: { id: expenseId },
      data: {
        amount: amount || expense.amount,
        category: category || expense.category,
        raw_category: category || expense.raw_category,
      },
    });

    return NextResponse.json(
      {
        status: true,
        message: "Expense updated successfully",
        data: updatedExpense,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error at api/expenses/[id] -> PUT:", error);
    return NextResponse.json(
      { status: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
