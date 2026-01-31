"use server";

import { db } from "@/lib/db";
import { tags } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { eq, asc } from "drizzle-orm";
import { requireAuth } from "@/lib/auth-guard";

export type Tag = {
  id: string;
  name: string;
};

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function getTags(): Promise<Tag[]> {
  const result = await db.select().from(tags).orderBy(asc(tags.name));
  return result;
}

export async function getTag(id: string): Promise<Tag | null> {
  const [tag] = await db.select().from(tags).where(eq(tags.id, id));
  return tag ?? null;
}

export async function createTag(name: string): Promise<ActionResult<Tag>> {
  await requireAuth();
  const trimmedName = name?.trim();
  if (!trimmedName) {
    return { success: false, error: "Name is required" };
  }

  try {
    const [tag] = await db
      .insert(tags)
      .values({ name: trimmedName })
      .returning();

    revalidatePath("/tags");
    return { success: true, data: tag };
  } catch (e) {
    if (e instanceof Error && e.message.includes("unique")) {
      return { success: false, error: "A tag with this name already exists" };
    }
    return { success: false, error: "Failed to create tag" };
  }
}

export async function updateTag(
  id: string,
  name: string
): Promise<ActionResult<Tag>> {
  await requireAuth();
  const trimmedName = name?.trim();
  if (!trimmedName) {
    return { success: false, error: "Name is required" };
  }

  if (!id) {
    return { success: false, error: "Tag ID is required" };
  }

  try {
    const [tag] = await db
      .update(tags)
      .set({ name: trimmedName })
      .where(eq(tags.id, id))
      .returning();

    if (!tag) {
      return { success: false, error: "Tag not found" };
    }

    revalidatePath("/tags");
    return { success: true, data: tag };
  } catch (e) {
    if (e instanceof Error && e.message.includes("unique")) {
      return { success: false, error: "A tag with this name already exists" };
    }
    return { success: false, error: "Failed to update tag" };
  }
}

export async function deleteTag(id: string): Promise<ActionResult> {
  await requireAuth();
  if (!id) {
    return { success: false, error: "Tag ID is required" };
  }

  try {
    const [deleted] = await db
      .delete(tags)
      .where(eq(tags.id, id))
      .returning();

    if (!deleted) {
      return { success: false, error: "Tag not found" };
    }

    revalidatePath("/tags");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Failed to delete tag" };
  }
}
