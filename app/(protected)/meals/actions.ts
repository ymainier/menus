"use server";

import { db } from "@/lib/db";
import { meals, mealTags, tags } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { eq, asc } from "drizzle-orm";
import { requireAuth } from "@/lib/auth-guard";

export type Tag = {
  id: string;
  name: string;
};

export type Meal = {
  id: string;
  name: string;
  createdAt: Date;
  tags: Tag[];
};

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function getMeals(): Promise<Meal[]> {
  // Fetch meals and tags in parallel to eliminate waterfall
  const [mealsResult, allMealTagsResult] = await Promise.all([
    db.select().from(meals).orderBy(asc(meals.name)),
    db
      .select({
        mealId: mealTags.mealId,
        tagId: tags.id,
        tagName: tags.name,
      })
      .from(mealTags)
      .innerJoin(tags, eq(mealTags.tagId, tags.id)),
  ]);

  if (mealsResult.length === 0) {
    return [];
  }

  const tagsByMealId = new Map<string, Tag[]>();
  for (const row of allMealTagsResult) {
    const existing = tagsByMealId.get(row.mealId) ?? [];
    existing.push({ id: row.tagId, name: row.tagName });
    tagsByMealId.set(row.mealId, existing);
  }

  return mealsResult.map((meal) => ({
    ...meal,
    tags: (tagsByMealId.get(meal.id) ?? []).sort((a, b) =>
      a.name.localeCompare(b.name)
    ),
  }));
}

export async function getMeal(id: string): Promise<Meal | null> {
  const [meal] = await db.select().from(meals).where(eq(meals.id, id));
  if (!meal) return null;

  const mealTagsResult = await db
    .select({
      tagId: tags.id,
      tagName: tags.name,
    })
    .from(mealTags)
    .innerJoin(tags, eq(mealTags.tagId, tags.id))
    .where(eq(mealTags.mealId, id));

  return {
    ...meal,
    tags: mealTagsResult
      .map((row) => ({ id: row.tagId, name: row.tagName }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  };
}

export async function createMeal(
  name: string,
  tagIds: string[] = []
): Promise<ActionResult<Meal>> {
  await requireAuth();
  const trimmedName = name?.trim();
  if (!trimmedName) {
    return { success: false, error: "Name is required" };
  }

  try {
    const [meal] = await db
      .insert(meals)
      .values({ name: trimmedName })
      .returning();

    if (tagIds.length > 0) {
      await db
        .insert(mealTags)
        .values(tagIds.map((tagId) => ({ mealId: meal.id, tagId })));
    }

    const mealTagsResult = await db
      .select({ tagId: tags.id, tagName: tags.name })
      .from(mealTags)
      .innerJoin(tags, eq(mealTags.tagId, tags.id))
      .where(eq(mealTags.mealId, meal.id));

    revalidatePath("/meals");
    return {
      success: true,
      data: {
        ...meal,
        tags: mealTagsResult
          .map((row) => ({ id: row.tagId, name: row.tagName }))
          .sort((a, b) => a.name.localeCompare(b.name)),
      },
    };
  } catch (e) {
    if (e instanceof Error && e.message.includes("unique")) {
      return { success: false, error: "A meal with this name already exists" };
    }
    return { success: false, error: "Failed to create meal" };
  }
}

export async function updateMeal(
  id: string,
  name: string,
  tagIds: string[] = []
): Promise<ActionResult<Meal>> {
  await requireAuth();
  const trimmedName = name?.trim();
  if (!trimmedName) {
    return { success: false, error: "Name is required" };
  }

  if (!id) {
    return { success: false, error: "Meal ID is required" };
  }

  try {
    const [meal] = await db
      .update(meals)
      .set({ name: trimmedName })
      .where(eq(meals.id, id))
      .returning();

    if (!meal) {
      return { success: false, error: "Meal not found" };
    }

    // Update tags: delete existing and insert new
    await db.delete(mealTags).where(eq(mealTags.mealId, id));
    if (tagIds.length > 0) {
      await db
        .insert(mealTags)
        .values(tagIds.map((tagId) => ({ mealId: id, tagId })));
    }

    const mealTagsResult = await db
      .select({ tagId: tags.id, tagName: tags.name })
      .from(mealTags)
      .innerJoin(tags, eq(mealTags.tagId, tags.id))
      .where(eq(mealTags.mealId, id));

    revalidatePath("/meals");
    return {
      success: true,
      data: {
        ...meal,
        tags: mealTagsResult
          .map((row) => ({ id: row.tagId, name: row.tagName }))
          .sort((a, b) => a.name.localeCompare(b.name)),
      },
    };
  } catch (e) {
    if (e instanceof Error && e.message.includes("unique")) {
      return { success: false, error: "A meal with this name already exists" };
    }
    return { success: false, error: "Failed to update meal" };
  }
}

export async function deleteMeal(id: string): Promise<ActionResult> {
  await requireAuth();
  if (!id) {
    return { success: false, error: "Meal ID is required" };
  }

  try {
    const [deleted] = await db
      .delete(meals)
      .where(eq(meals.id, id))
      .returning();

    if (!deleted) {
      return { success: false, error: "Meal not found" };
    }

    revalidatePath("/meals");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Failed to delete meal" };
  }
}
