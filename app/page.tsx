export const dynamic = "force-dynamic";

import Link from "next/link";
import { getCurrentWeekPlanWithMealsAndTags } from "./plans/actions";
import { getWeekDateRange, formatDate } from "@/lib/week-utils";
import { PlannedMealsTable } from "@/components/planned-meals-table";

export default async function Home() {
  const plan = await getCurrentWeekPlanWithMealsAndTags();

  if (!plan) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">This Week</h1>
        <p className="text-muted-foreground">
          No plan for this week yet.{" "}
          <Link href="/plans/new" className="underline hover:text-foreground">
            Create one
          </Link>
          .
        </p>
      </div>
    );
  }

  const { start, end } = getWeekDateRange(plan.weekNumber);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">This Week</h1>
        <p className="text-sm text-muted-foreground">
          <Link
            href={`/plans/${plan.id}`}
            className="underline hover:text-foreground"
          >
            {plan.weekNumber}
          </Link>{" "}
          &mdash; {formatDate(start)} to {formatDate(end)}
        </p>
      </div>
      {plan.meals.length === 0 ? (
        <p className="text-muted-foreground">
          No meals planned.{" "}
          <Link
            href={`/plans/${plan.id}/edit`}
            className="underline hover:text-foreground"
          >
            Add some
          </Link>
          .
        </p>
      ) : (
        <PlannedMealsTable meals={plan.meals} />
      )}
    </div>
  );
}
