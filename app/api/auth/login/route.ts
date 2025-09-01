import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs"; // or 'bcrypt' if you installed @types/bcrypt
import prisma from "@/lib/prisma"; // Adjust path to your prisma instance
import { getJwtToken } from "@/lib/jwt"; // Adjust path to your JWT utility

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

    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { status: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { status: false, message: "No user exists with this email" },
        { status: 400 }
      );
    }

    // Compare password
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return NextResponse.json(
        { status: false, message: "Incorrect password" },
        { status: 400 }
      );
    }

    // Generate JWT token
    const token = getJwtToken(user.id);

    return NextResponse.json(
      {
        status: true,
        message: "User logged in successfully",
        data: {
          user: {
            name: user.name,
            email: user.email,
            monthlyBudget: user.monthlyBudget,
            currency: user.currency,
            createdAt: user.createdAt,
          },
          token,
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error at api/auth/login -> POST:", err);
    return NextResponse.json(
      { status: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
