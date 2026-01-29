import { notFound } from "next/navigation";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

export default async function PlanPage({ params }: PlanPageProps) {
  const { id } = await params;
  const plan = await getWeekPlanWithMealsAndTags(id);

  if (!plan) {
    notFound();
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      weekday: "short",
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
          <span className="text-lg font-bold">{plan.weekNumber}</span>{" "}
          <span className="text-sm text-muted-foreground">
            from {formatDate(start)} to {formatDate(end)}
          </span>
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Meals</label>
          {plan.meals.length === 0 ? (
            <p className="text-lg text-muted-foreground">No meals planned</p>
          ) : (
            <div className="border rounded-md mt-1">
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
        <ButtonGroup>
          <Button variant="outline" size="icon" asChild>
            <Link href={`/plans/${id}/edit`}>
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit {plan.weekNumber}</span>
            </Link>
          </Button>
          <DeletePlanButton id={id} weekNumber={plan.weekNumber} />
        </ButtonGroup>
      </div>
    </>
  );
}
