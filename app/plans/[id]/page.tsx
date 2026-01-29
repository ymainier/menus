import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { getWeekPlanWithMealsAndTags } from "../actions";
import { DeletePlanButton } from "./delete-button";
import { SetBreadcrumb } from "@/components/set-breadcrumb";
import { MealCheckbox } from "./meal-checkbox";

interface PlanPageProps {
  params: Promise<{ id: string }>;
}

function extractWeek(weekNumber: string): string {
  // weekNumber format is "2025-W04", extract just "W04"
  const match = weekNumber.match(/W\d+/);
  return match ? match[0] : weekNumber;
}

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

function formatDateRange(start: Date, end: Date): string {
  const formatDay = (d: Date) => {
    const day = d.getDate();
    const suffix =
      day === 1 || day === 21 || day === 31
        ? "st"
        : day === 2 || day === 22
          ? "nd"
          : day === 3 || day === 23
            ? "rd"
            : "th";
    return `${day}${suffix}`;
  };

  const startMonth = start.toLocaleDateString("en-US", { month: "short" });
  const endMonth = end.toLocaleDateString("en-US", { month: "short" });

  return `Sat. ${formatDay(start)} ${startMonth} to Fri. ${formatDay(end)} ${endMonth}`;
}

export default async function PlanPage({ params }: PlanPageProps) {
  const { id } = await params;
  const plan = await getWeekPlanWithMealsAndTags(id);

  if (!plan) {
    notFound();
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const { start, end } = getWeekDateRange(plan.weekNumber);

  return (
    <>
      <SetBreadcrumb
        items={[
          { label: "Plans", href: "/plans" },
          { label: extractWeek(plan.weekNumber) },
        ]}
      />
      <div className="space-y-4">
        <div>
          <p className="text-lg font-bold">{plan.weekNumber}</p>
          <p className="text-sm text-muted-foreground">
            {formatDateRange(start, end)}
          </p>
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Meals</label>
          {plan.meals.length === 0 ? (
            <p className="text-lg text-muted-foreground">No meals planned</p>
          ) : (
            <ul className="space-y-2 mt-1">
              {plan.meals.map((meal) => (
                <li key={meal.id} className="flex items-center gap-3">
                  <MealCheckbox
                    plannedMealId={meal.id}
                    done={meal.done}
                    mealName={meal.mealName}
                  />
                  <label
                    htmlFor={meal.id}
                    className={`flex-1 cursor-pointer ${meal.done ? "line-through text-muted-foreground" : ""}`}
                  >
                    {meal.mealName}
                  </label>
                  {meal.tags.length > 0 && (
                    <div className="flex gap-1">
                      {meal.tags.map((tag) => (
                        <Badge key={tag.id} variant="secondary">
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Created</label>
          <p className="text-lg">{formatDate(plan.createdAt)}</p>
        </div>
        <div className="flex gap-2">
          <DeletePlanButton id={id} weekNumber={plan.weekNumber} />
        </div>
      </div>
    </>
  );
}
