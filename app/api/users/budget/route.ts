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

    // Get user's monthly budget
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { monthlyBudget: true },
    });

    if (!user) {
      return NextResponse.json(
        { status: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: true,
        message: "User budget fetched successfully",
        data: { monthlyBudget: user.monthlyBudget },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error at api/users/budget -> GET:", err);
    return NextResponse.json(
      { status: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyToken(req);

    if (!authResult.success) {
      return authResult.response!; // Return the auth error response
    }

    const userId = authResult.userId!;

    // Check if request has body
    const body = await req.json().catch(() => null);

    if (!body || body.monthlyBudget === undefined) {
      return NextResponse.json(
        { status: false, message: "Missing request body" },
        { status: 400 }
      );
    }

    const { monthlyBudget } = body;

    // Validate monthlyBudget is a number
    if (typeof monthlyBudget !== "number" || isNaN(monthlyBudget)) {
      return NextResponse.json(
        { status: false, message: "Monthly budget must be a number" },
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

    // Update user's monthly budget
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { monthlyBudget },
    });

    return NextResponse.json(
      {
        status: true,
        message: "Monthly budget updated successfully",
        data: {
          user: {
            name: updatedUser.name,
            email: updatedUser.email,
            monthlyBudget: updatedUser.monthlyBudget,
            currency: updatedUser.currency,
            createdAt: updatedUser.createdAt,
          },
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error at api/users/budget -> PUT:", error);
    return NextResponse.json(
      { status: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
