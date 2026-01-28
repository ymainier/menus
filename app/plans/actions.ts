"use server";

import { db } from "@/lib/db";
import { weekPlans, plannedMeals } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { eq, desc, sql } from "drizzle-orm";

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
