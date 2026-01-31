"use server";

import { db } from "@/lib/db";
import { weekPlans, plannedMeals, meals, mealTags, tags } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { eq, desc, sql, asc, inArray } from "drizzle-orm";
import { getCurrentWeekNumber, incrementWeek } from "@/lib/week-utils";
import { requireAuth } from "@/lib/auth-guard";

export type WeekPlan = {
  id: string;
  weekNumber: string;
  createdAt: Date;
  mealCount: number;
};

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function getWeekPlans(): Promise<WeekPlan[]> {
  const result = await db
    .select({
      id: weekPlans.id,
      weekNumber: weekPlans.weekNumber,
      createdAt: weekPlans.createdAt,
      mealCount: sql<number>`count(${plannedMeals.id})::int`,
    })
    .from(weekPlans)
    .leftJoin(plannedMeals, eq(plannedMeals.weekPlanId, weekPlans.id))
    .groupBy(weekPlans.id)
    .orderBy(desc(weekPlans.weekNumber));

  return result;
}

export type WeekPlanWithMealNames = {
  id: string;
  weekNumber: string;
  createdAt: Date;
  mealNames: string[];
  doneCount: number;
};

export async function getWeekPlansWithMeals(): Promise<WeekPlanWithMealNames[]> {
  const plansResult = await db
    .select()
    .from(weekPlans)
    .orderBy(desc(weekPlans.weekNumber));

  if (plansResult.length === 0) {
    return [];
  }

  const planIds = plansResult.map((p) => p.id);
  const mealsResult = await db
    .select({
      weekPlanId: plannedMeals.weekPlanId,
      mealName: meals.name,
      done: plannedMeals.done,
    })
    .from(plannedMeals)
    .innerJoin(meals, eq(plannedMeals.mealId, meals.id))
    .where(inArray(plannedMeals.weekPlanId, planIds))
    .orderBy(asc(meals.name));

  const mealsByPlanId = new Map<string, { names: string[]; doneCount: number }>();
  for (const row of mealsResult) {
    const existing = mealsByPlanId.get(row.weekPlanId) ?? { names: [], doneCount: 0 };
    existing.names.push(row.mealName);
    if (row.done) existing.doneCount++;
    mealsByPlanId.set(row.weekPlanId, existing);
  }

  return plansResult.map((plan) => {
    const data = mealsByPlanId.get(plan.id) ?? { names: [], doneCount: 0 };
    return {
      ...plan,
      mealNames: data.names,
      doneCount: data.doneCount,
    };
  });
}

export async function getWeekPlan(id: string): Promise<WeekPlan | null> {
  const [result] = await db
    .select({
      id: weekPlans.id,
      weekNumber: weekPlans.weekNumber,
      createdAt: weekPlans.createdAt,
      mealCount: sql<number>`count(${plannedMeals.id})::int`,
    })
    .from(weekPlans)
    .leftJoin(plannedMeals, eq(plannedMeals.weekPlanId, weekPlans.id))
    .where(eq(weekPlans.id, id))
    .groupBy(weekPlans.id);

  return result ?? null;
}

export async function createWeekPlan(
  weekNumber: string
): Promise<ActionResult<{ id: string; weekNumber: string; createdAt: Date }>> {
  await requireAuth();
  const trimmedWeekNumber = weekNumber?.trim();
  if (!trimmedWeekNumber) {
    return { success: false, error: "Week number is required" };
  }

  // Validate ISO 8601 week format
  const weekRegex = /^\d{4}-W(0[1-9]|[1-4]\d|5[0-3])$/;
  if (!weekRegex.test(trimmedWeekNumber)) {
    return {
      success: false,
      error: "Invalid week format. Use ISO 8601 format (e.g., 2025-W04)",
    };
  }

  try {
    const [plan] = await db
      .insert(weekPlans)
      .values({ weekNumber: trimmedWeekNumber })
      .returning();

    revalidatePath("/plans");
    return { success: true, data: plan };
  } catch (e) {
    if (e instanceof Error && e.message.includes("unique")) {
      return {
        success: false,
        error: "A plan for this week already exists",
      };
    }
    return { success: false, error: "Failed to create week plan" };
  }
}

export async function deleteWeekPlan(id: string): Promise<ActionResult> {
  await requireAuth();
  if (!id) {
    return { success: false, error: "Plan ID is required" };
  }

  try {
    const [deleted] = await db
      .delete(weekPlans)
      .where(eq(weekPlans.id, id))
      .returning();

    if (!deleted) {
      return { success: false, error: "Plan not found" };
    }

    revalidatePath("/plans");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Failed to delete plan" };
  }
}

export type PlannedMeal = {
  id: string;
  mealId: string;
  mealName: string;
  done: boolean;
};

export type WeekPlanWithMeals = {
  id: string;
  weekNumber: string;
  createdAt: Date;
  meals: PlannedMeal[];
};

export async function getWeekPlanWithMeals(
  id: string
): Promise<WeekPlanWithMeals | null> {
  const [plan] = await db.select().from(weekPlans).where(eq(weekPlans.id, id));

  if (!plan) return null;

  const planMeals = await db
    .select({
      id: plannedMeals.id,
      mealId: meals.id,
      mealName: meals.name,
      done: plannedMeals.done,
    })
    .from(plannedMeals)
    .innerJoin(meals, eq(plannedMeals.mealId, meals.id))
    .where(eq(plannedMeals.weekPlanId, id))
    .orderBy(asc(meals.name));

  return {
    ...plan,
    meals: planMeals,
  };
}

export type MealTag = {
  id: string;
  name: string;
};

export type MealWithTags = {
  id: string;
  name: string;
  tags: MealTag[];
};

export type PlannedMealWithTags = {
  id: string;
  mealId: string;
  mealName: string;
  done: boolean;
  tags: MealTag[];
};

export type WeekPlanWithMealsAndTags = {
  id: string;
  weekNumber: string;
  createdAt: Date;
  meals: PlannedMealWithTags[];
};

export async function getWeekPlanWithMealsAndTags(
  id: string
): Promise<WeekPlanWithMealsAndTags | null> {
  const [plan] = await db.select().from(weekPlans).where(eq(weekPlans.id, id));

  if (!plan) return null;

  const planMeals = await db
    .select({
      id: plannedMeals.id,
      mealId: meals.id,
      mealName: meals.name,
      done: plannedMeals.done,
    })
    .from(plannedMeals)
    .innerJoin(meals, eq(plannedMeals.mealId, meals.id))
    .where(eq(plannedMeals.weekPlanId, id))
    .orderBy(asc(meals.name));

  if (planMeals.length === 0) {
    return { ...plan, meals: [] };
  }

  // Fetch tags for all meals
  const mealIds = planMeals.map((m) => m.mealId);
  const mealTagsResult = await db
    .select({
      mealId: mealTags.mealId,
      tagId: tags.id,
      tagName: tags.name,
    })
    .from(mealTags)
    .innerJoin(tags, eq(mealTags.tagId, tags.id))
    .where(inArray(mealTags.mealId, mealIds));

  const tagsByMealId = new Map<string, MealTag[]>();
  for (const row of mealTagsResult) {
    const existing = tagsByMealId.get(row.mealId) ?? [];
    existing.push({ id: row.tagId, name: row.tagName });
    tagsByMealId.set(row.mealId, existing);
  }

  return {
    ...plan,
    meals: planMeals.map((meal) => ({
      ...meal,
      tags: (tagsByMealId.get(meal.mealId) ?? []).sort((a, b) =>
        a.name.localeCompare(b.name)
      ),
    })),
  };
}

export async function togglePlannedMealDone(
  plannedMealId: string
): Promise<ActionResult<{ done: boolean }>> {
  await requireAuth();
  if (!plannedMealId) {
    return { success: false, error: "Planned meal ID is required" };
  }

  try {
    // Get current state
    const [current] = await db
      .select({ done: plannedMeals.done, weekPlanId: plannedMeals.weekPlanId })
      .from(plannedMeals)
      .where(eq(plannedMeals.id, plannedMealId));

    if (!current) {
      return { success: false, error: "Planned meal not found" };
    }

    // Toggle the done state
    const [updated] = await db
      .update(plannedMeals)
      .set({ done: !current.done })
      .where(eq(plannedMeals.id, plannedMealId))
      .returning({ done: plannedMeals.done });

    revalidatePath(`/plans/${current.weekPlanId}`);
    revalidatePath("/");
    return { success: true, data: { done: updated.done } };
  } catch {
    return { success: false, error: "Failed to toggle meal status" };
  }
}

export async function getNextAvailableWeek(): Promise<string> {
  // Get all existing week numbers
  const existingPlans = await db
    .select({ weekNumber: weekPlans.weekNumber })
    .from(weekPlans);
  const existingWeeks = new Set(existingPlans.map((p) => p.weekNumber));

  // Start from next week
  let candidate = incrementWeek(getCurrentWeekNumber());

  // Find first available week (up to 10 iterations)
  for (let i = 0; i < 10; i++) {
    if (!existingWeeks.has(candidate)) {
      return candidate;
    }
    candidate = incrementWeek(candidate);
  }

  // If all 10 weeks are taken, return the last checked week
  return candidate;
}

export async function getCurrentWeekPlanWithMealsAndTags(): Promise<WeekPlanWithMealsAndTags | null> {
  const currentWeekNumber = getCurrentWeekNumber();

  const [plan] = await db
    .select()
    .from(weekPlans)
    .where(eq(weekPlans.weekNumber, currentWeekNumber));

  if (!plan) return null;

  const planMeals = await db
    .select({
      id: plannedMeals.id,
      mealId: meals.id,
      mealName: meals.name,
      done: plannedMeals.done,
    })
    .from(plannedMeals)
    .innerJoin(meals, eq(plannedMeals.mealId, meals.id))
    .where(eq(plannedMeals.weekPlanId, plan.id))
    .orderBy(asc(meals.name));

  if (planMeals.length === 0) {
    return { ...plan, meals: [] };
  }

  // Fetch tags for all meals
  const mealIds = planMeals.map((m) => m.mealId);
  const mealTagsResult = await db
    .select({
      mealId: mealTags.mealId,
      tagId: tags.id,
      tagName: tags.name,
    })
    .from(mealTags)
    .innerJoin(tags, eq(mealTags.tagId, tags.id))
    .where(inArray(mealTags.mealId, mealIds));

  const tagsByMealId = new Map<string, MealTag[]>();
  for (const row of mealTagsResult) {
    const existing = tagsByMealId.get(row.mealId) ?? [];
    existing.push({ id: row.tagId, name: row.tagName });
    tagsByMealId.set(row.mealId, existing);
  }

  return {
    ...plan,
    meals: planMeals.map((meal) => ({
      ...meal,
      tags: (tagsByMealId.get(meal.mealId) ?? []).sort((a, b) =>
        a.name.localeCompare(b.name)
      ),
    })),
  };
}

export async function getAllMealsWithTags(): Promise<MealWithTags[]> {
  const mealsResult = await db
    .select({ id: meals.id, name: meals.name })
    .from(meals)
    .orderBy(asc(meals.name));

  if (mealsResult.length === 0) {
    return [];
  }

  const mealIds = mealsResult.map((m) => m.id);
  const mealTagsResult = await db
    .select({
      mealId: mealTags.mealId,
      tagId: tags.id,
      tagName: tags.name,
    })
    .from(mealTags)
    .innerJoin(tags, eq(mealTags.tagId, tags.id))
    .where(inArray(mealTags.mealId, mealIds));

  const tagsByMealId = new Map<string, MealTag[]>();
  for (const row of mealTagsResult) {
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

export async function updateWeekPlan(
  id: string,
  weekNumber: string,
  mealIds: string[]
): Promise<ActionResult<WeekPlanWithMeals>> {
  await requireAuth();
  const trimmedWeekNumber = weekNumber?.trim();
  if (!trimmedWeekNumber) {
    return { success: false, error: "Week number is required" };
  }

  if (!id) {
    return { success: false, error: "Plan ID is required" };
  }

  // Validate ISO 8601 week format
  const weekRegex = /^\d{4}-W(0[1-9]|[1-4]\d|5[0-3])$/;
  if (!weekRegex.test(trimmedWeekNumber)) {
    return {
      success: false,
      error: "Invalid week format. Use ISO 8601 format (e.g., 2025-W04)",
    };
  }

  try {
    const [plan] = await db
      .update(weekPlans)
      .set({ weekNumber: trimmedWeekNumber })
      .where(eq(weekPlans.id, id))
      .returning();

    if (!plan) {
      return { success: false, error: "Plan not found" };
    }

    // Update meals: delete existing and insert new
    await db.delete(plannedMeals).where(eq(plannedMeals.weekPlanId, id));
    if (mealIds.length > 0) {
      await db
        .insert(plannedMeals)
        .values(mealIds.map((mealId) => ({ weekPlanId: id, mealId })));
    }

    const planMeals = await db
      .select({
        id: plannedMeals.id,
        mealId: meals.id,
        mealName: meals.name,
        done: plannedMeals.done,
      })
      .from(plannedMeals)
      .innerJoin(meals, eq(plannedMeals.mealId, meals.id))
      .where(eq(plannedMeals.weekPlanId, id))
      .orderBy(asc(meals.name));

    revalidatePath("/plans");
    return {
      success: true,
      data: {
        ...plan,
        meals: planMeals,
      },
    };
  } catch (e) {
    if (e instanceof Error && e.message.includes("unique")) {
      return { success: false, error: "A plan for this week already exists" };
    }
    return { success: false, error: "Failed to update plan" };
  }
}
