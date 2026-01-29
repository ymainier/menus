export const dynamic = "force-dynamic";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCurrentWeekPlanWithMealsAndTags } from "./plans/actions";
import { MealCheckbox } from "./plans/[id]/meal-checkbox";

function getWeekDateRange(weekNumber: string): { start: Date; end: Date } {
  // Parse ISO week format "2025-W04"
  const match = weekNumber.match(/^(\d{4})-W(\d{2})$/);
  if (!match) {
    throw new Error(`Invalid week format: ${weekNumber}`);
  }

  const year = parseInt(match[1], 10);
  const week = parseInt(match[2], 10);

  // Find Jan 4 of the year (always in week 1)
  const jan4 = new Date(year, 0, 4);
  // Find Monday of week 1
  const dayOfWeek = jan4.getDay();
  const mondayOfWeek1 = new Date(jan4);
  // getDay(): 0=Sun, 1=Mon, ..., 6=Sat
  // We need to go back to Monday
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  mondayOfWeek1.setDate(jan4.getDate() - daysToMonday);

  // Find Monday of the requested week
  const mondayOfWeek = new Date(mondayOfWeek1);
  mondayOfWeek.setDate(mondayOfWeek1.getDate() + (week - 1) * 7);

  // Our week starts on Saturday (Monday + 5) and ends on Friday (Saturday + 6)
  const saturday = new Date(mondayOfWeek);
  saturday.setDate(mondayOfWeek.getDate() + 5);

  const friday = new Date(saturday);
  friday.setDate(saturday.getDate() + 6);

  return { start: saturday, end: friday };
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    weekday: "short",
  });
}

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
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Tags</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plan.meals.map((meal) => (
                <TableRow key={meal.id}>
                  <TableCell>
                    <MealCheckbox
                      plannedMealId={meal.id}
                      done={meal.done}
                      mealName={meal.mealName}
                    />
                  </TableCell>
                  <TableCell>
                    <label
                      htmlFor={meal.id}
                      className={`cursor-pointer ${meal.done ? "line-through text-muted-foreground" : ""}`}
                    >
                      {meal.mealName}
                    </label>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {meal.tags.map((tag) => (
                        <Badge key={tag.id} variant="secondary">
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
