"use server";

import { db } from "@/lib/db";
import { weekPlans, plannedMeals, meals, mealTags, tags } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { eq, desc, sql, asc, inArray } from "drizzle-orm";

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
    })
    .from(plannedMeals)
    .innerJoin(meals, eq(plannedMeals.mealId, meals.id))
    .where(inArray(plannedMeals.weekPlanId, planIds))
    .orderBy(asc(meals.name));

  const mealsByPlanId = new Map<string, string[]>();
  for (const row of mealsResult) {
    const existing = mealsByPlanId.get(row.weekPlanId) ?? [];
    existing.push(row.mealName);
    mealsByPlanId.set(row.weekPlanId, existing);
  }

  return plansResult.map((plan) => ({
    ...plan,
    mealNames: mealsByPlanId.get(plan.id) ?? [],
  }));
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

function getCurrentWeekNumber(): string {
  const now = new Date();

  // Get the ISO week for today
  const year = now.getFullYear();
  const jan4 = new Date(year, 0, 4);
  const dayOfWeek = jan4.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const mondayOfWeek1 = new Date(jan4);
  mondayOfWeek1.setDate(jan4.getDate() - daysToMonday);

  // Calculate which ISO week today is in
  const diffMs = now.getTime() - mondayOfWeek1.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const isoWeek = Math.floor(diffDays / 7) + 1;

  // Get Monday of the current ISO week
  const mondayOfCurrentWeek = new Date(mondayOfWeek1);
  mondayOfCurrentWeek.setDate(mondayOfWeek1.getDate() + (isoWeek - 1) * 7);

  // Our app weeks run Saturday to Friday
  // Saturday = Monday + 5
  const saturdayOfCurrentWeek = new Date(mondayOfCurrentWeek);
  saturdayOfCurrentWeek.setDate(mondayOfCurrentWeek.getDate() + 5);

  // If today is before the Saturday of this ISO week, we're in the previous app week
  if (now < saturdayOfCurrentWeek) {
    const prevWeek = isoWeek - 1;
    if (prevWeek < 1) {
      // Handle year boundary - use week 52 or 53 of previous year
      const prevYear = year - 1;
      const prevYearJan4 = new Date(prevYear, 0, 4);
      const prevYearDayOfWeek = prevYearJan4.getDay();
      const prevYearDaysToMonday =
        prevYearDayOfWeek === 0 ? 6 : prevYearDayOfWeek - 1;
      const prevYearMondayOfWeek1 = new Date(prevYearJan4);
      prevYearMondayOfWeek1.setDate(prevYearJan4.getDate() - prevYearDaysToMonday);

      // Find the last week of the previous year
      const dec31 = new Date(prevYear, 11, 31);
      const diffFromPrevYear = dec31.getTime() - prevYearMondayOfWeek1.getTime();
      const lastWeek = Math.floor(diffFromPrevYear / (1000 * 60 * 60 * 24 * 7)) + 1;
      return `${prevYear}-W${String(lastWeek).padStart(2, "0")}`;
    }
    return `${year}-W${String(prevWeek).padStart(2, "0")}`;
  }

  return `${year}-W${String(isoWeek).padStart(2, "0")}`;
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
