import { db } from "../lib/db";
import { user, account } from "../lib/db/schema";
import { auth } from "../lib/auth";
import { eq } from "drizzle-orm";
import crypto from "crypto";

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error("Usage: pnpm user:add <email>");
    process.exit(1);
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.error("Invalid email format");
    process.exit(1);
  }

  // Check if user already exists
  const [existingUser] = await db
    .select()
    .from(user)
    .where(eq(user.email, email));

  if (existingUser) {
    console.error(`User with email "${email}" already exists`);
    process.exit(1);
  }

  // Generate a strong random password
  const password = crypto.randomBytes(16).toString("base64url");

  try {
    // Use better-auth's internal context to hash the password
    const ctx = await auth.$context;
    const hashedPassword = await ctx.password.hash(password);

    const now = new Date();
    const userId = crypto.randomUUID();

    // Create user
    await db.insert(user).values({
      id: userId,
      email,
      name: email.split("@")[0],
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    });

    // Create credential account
    await db.insert(account).values({
      id: crypto.randomUUID(),
      userId,
      accountId: userId,
      providerId: "credential",
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
    });

    console.log(`User created successfully!`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`\nSave this password - it cannot be recovered.`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error("Failed to create user");
    }
    process.exit(1);
  }

  process.exit(0);
}

main();
