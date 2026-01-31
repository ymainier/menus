import { db } from "../lib/db";
import { user, session, account } from "../lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error("Usage: pnpm user:delete <email>");
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

    // Delete sessions first (foreign key constraint)
    await db.delete(session).where(eq(session.userId, existingUser.id));

    // Delete accounts (foreign key constraint)
    await db.delete(account).where(eq(account.userId, existingUser.id));

    // Delete the user
    await db.delete(user).where(eq(user.id, existingUser.id));

    console.log(`User "${email}" deleted successfully`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error("Failed to delete user");
    }
    process.exit(1);
  }

  process.exit(0);
}

main();
