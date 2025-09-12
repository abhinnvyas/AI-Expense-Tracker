import { type NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const authResult = await verifyToken(req);
    if (!authResult.success) {
      return authResult.response!;
    }

    const userId = authResult.userId!;

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    // Build where clause
    const where: any = {
      userId: userId,
    };

    // Date filtering
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        // Add 1 day to include the end date
        const endDateTime = new Date(endDate);
        endDateTime.setDate(endDateTime.getDate() + 1);
        where.createdAt.lt = endDateTime;
      }
    }

    // Category filtering
    if (category && category !== "all") {
      where.category = category;
    }

    // Search filtering
    if (search) {
      where.OR = [
        { description: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ];
    }

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    // Get categories for filter dropdown
    const categories = await prisma.expense.findMany({
      where: { userId: userId },
      select: { category: true },
      distinct: ["category"],
    });

    const uniqueCategories = categories
      .map((c) => c.category)
      .filter(Boolean)
      .sort();

    return NextResponse.json({
      success: true,
      data: {
        expenses,
        categories: uniqueCategories,
        totalCount: expenses.length,
      },
    });
  } catch (error) {
    console.error("Error fetching expenses by date:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
