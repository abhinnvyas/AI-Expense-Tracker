import bcrypt from "bcryptjs"; // or 'bcrypt' if you're using that

/**
 * Generate hash for password
 */
export async function generateHash(password: string): Promise<string> {
  const saltRounds = 12; // Adjust as needed
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Compare password with hash
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}
