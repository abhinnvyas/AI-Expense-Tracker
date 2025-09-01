import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

/**
 * Verify token and return user ID if valid
 * Returns object with success status and either userId or error response
 */
export async function verifyToken(req: NextRequest): Promise<{
  success: boolean;
  userId?: string;
  response?: NextResponse;
}> {
  try {
    // Get authorization header
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        success: false,
        response: NextResponse.json(
          { status: false, msg: "Access Denied" },
          { status: 401 }
        ),
      };
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    if (!token) {
      return {
        success: false,
        response: NextResponse.json(
          { status: false, msg: "Access Denied" },
          { status: 401 }
        ),
      };
    }

    // Verify JWT
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not set in environment variables");
    }

    let decoded: { userId: string };
    try {
      decoded = jwt.verify(token, secret) as { userId: string };
    } catch (err) {
      return {
        success: false,
        response: NextResponse.json(
          { status: false, message: "Invalid Token" },
          { status: 400 }
        ),
      };
    }

    // Check if user exists in database
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
    });

    if (!user) {
      return {
        success: false,
        response: NextResponse.json(
          { status: false, message: "Access Denied" },
          { status: 400 }
        ),
      };
    }

    console.log("Decoded User ID:", decoded.userId);

    return {
      success: true,
      userId: decoded.userId,
    };
  } catch (error) {
    console.error("Token verification failed:", error);
    return {
      success: false,
      response: NextResponse.json(
        { status: false, message: "Internal server error" },
        { status: 500 }
      ),
    };
  }
}
