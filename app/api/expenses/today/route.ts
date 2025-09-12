import { type NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyToken(req);
    if (!authResult.success) {
      return authResult.response!;
    }

    const userId = authResult.userId!;

    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    // Fetch today's expenses for the user
    const expenses = await prisma.expense.findMany({
      where: {
        userId: userId,
        createdAt: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      status: true,
      data: expenses,
    });
  } catch (error) {
    console.error("Error fetching today's expenses:", error);
    return NextResponse.json(
      {
        status: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
