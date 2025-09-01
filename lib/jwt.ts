import jwt from "jsonwebtoken";

export function getJwtToken(userId: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET is required but not set in environment variables"
    );
  }
  return jwt.sign({ userId }, secret, { expiresIn: "7d" });
}
