import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Adjust path to your prisma instance
import { generateHash } from "@/lib/password"; // Adjust path to your password utility

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

    const { name, email, password, monthlyBudget } = body;

    // Validate required fields
    if (!name || !monthlyBudget || !password || !email) {
      return NextResponse.json(
        { status: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate monthlyBudget is a number
    if (typeof monthlyBudget !== "number" || isNaN(monthlyBudget)) {
      return NextResponse.json(
        { status: false, message: "Monthly budget must be a number" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { name, email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          status: false,
          message: "User with this name and email already exists",
        },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await generateHash(password);

    // Create new user
    const user = await prisma.user.create({
      data: { name, email, password: passwordHash, monthlyBudget },
    });

    return NextResponse.json(
      {
        status: true,
        message: "User created successfully please login",
        data: {
          user: {
            name: user.name,
            email: user.email,
            monthlyBudget: user.monthlyBudget,
            currency: user.currency,
            createdAt: user.createdAt,
          },
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Error at api/auth/register -> POST:", err);
    return NextResponse.json(
      { status: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
