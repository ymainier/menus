import { db } from "../lib/db";
import { user, account } from "../lib/db/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";
import { auth } from "../lib/auth";

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error("Usage: pnpm user:reset-password <email>");
    process.exit(1);
  }

  try {
    // Find the user by email
    const [existingUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, email));

    if (!existingUser) {
      console.error(`User with email "${email}" not found`);
      process.exit(1);
    }

    // Generate a new strong random password
    const newPassword = crypto.randomBytes(16).toString("base64url");

    // Hash the new password using better-auth's internal context
    const ctx = await auth.$context;
    const hashedPassword = await ctx.password.hash(newPassword);

    // Update the password in the account table
    const [updated] = await db
      .update(account)
      .set({ password: hashedPassword })
      .where(
        and(
          eq(account.userId, existingUser.id),
          eq(account.providerId, "credential")
        )
      )
      .returning();

    if (!updated) {
      console.error("Failed to update password - no credential account found");
      process.exit(1);
    }

    console.log(`Password reset successfully!`);
    console.log(`Email: ${email}`);
    console.log(`New password: ${newPassword}`);
    console.log(`\nSave this password - it cannot be recovered.`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error("Failed to reset password");
    }
    process.exit(1);
  }

  process.exit(0);
}

main();
