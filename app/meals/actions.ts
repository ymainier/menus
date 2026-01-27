"use server";

import { db } from "@/lib/db";
import { meals } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { eq, asc } from "drizzle-orm";

export type Meal = {
  id: string;
  name: string;
  createdAt: Date;
};

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function getMeals(): Promise<Meal[]> {
  const result = await db
    .select()
    .from(meals)
    .orderBy(asc(meals.name));
  return result;
}

export async function createMeal(name: string): Promise<ActionResult<Meal>> {
  const trimmedName = name?.trim();
  if (!trimmedName) {
    return { success: false, error: "Name is required" };
  }

  try {
    const [meal] = await db
      .insert(meals)
      .values({ name: trimmedName })
      .returning();

    revalidatePath("/meals");
    return { success: true, data: meal };
  } catch (e) {
    if (e instanceof Error && e.message.includes("unique")) {
      return { success: false, error: "A meal with this name already exists" };
    }
    return { success: false, error: "Failed to create meal" };
  }
}

export async function updateMeal(
  id: string,
  name: string
): Promise<ActionResult<Meal>> {
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

    revalidatePath("/meals");
    return { success: true, data: meal };
  } catch (e) {
    if (e instanceof Error && e.message.includes("unique")) {
      return { success: false, error: "A meal with this name already exists" };
    }
    return { success: false, error: "Failed to update meal" };
  }
}

export async function deleteMeal(id: string): Promise<ActionResult> {
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
  } catch (e) {
    if (
      e instanceof Error &&
      e.message.includes("violates foreign key constraint")
    ) {
      return {
        success: false,
        error: "Cannot delete meal that is used in a week plan",
      };
    }
    return { success: false, error: "Failed to delete meal" };
  }
}
