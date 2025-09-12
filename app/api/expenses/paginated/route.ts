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

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        {
          status: false,
          message: "Invalid pagination parameters",
        },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;

    // Build where clause for search
    const whereClause: any = {
      userId: userId,
    };

    if (search) {
      whereClause.OR = [
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          category: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    // Get total count for pagination
    const totalCount = await prisma.expense.count({
      where: whereClause,
    });

    // Fetch paginated expenses
    const expenses = await prisma.expense.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
      skip: skip,
      take: limit,
    });

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      status: true,
      data: {
        expenses,
        totalCount,
        totalPages,
        currentPage: page,
        pageSize: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching paginated expenses:", error);
    return NextResponse.json(
      {
        status: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
