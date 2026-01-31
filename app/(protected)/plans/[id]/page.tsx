import { notFound } from "next/navigation";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { getWeekPlanWithMealsAndTags } from "../actions";
import { DeletePlanButton } from "./delete-button";
import { SetBreadcrumb } from "@/components/set-breadcrumb";
import { getWeekDateRange, formatDate } from "@/lib/week-utils";
import { PlannedMealsTable } from "@/components/planned-meals-table";

interface PlanPageProps {
  params: Promise<{ id: string }>;
}

function extractWeek(weekNumber: string): string {
  // weekNumber format is "2025-W04", extract just "W04"
  const match = weekNumber.match(/W\d+/);
  return match ? match[0] : weekNumber;
}

export default async function PlanPage({ params }: PlanPageProps) {
  const { id } = await params;
  const plan = await getWeekPlanWithMealsAndTags(id);

  if (!plan) {
    notFound();
  }

  const { start, end } = getWeekDateRange(plan.weekNumber);
  const doneCount = plan.meals.filter((m) => m.done).length;

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
          <h1 className="text-lg font-bold">
            {plan.weekNumber}
            {plan.meals.length > 0 && ` - ${doneCount}/${plan.meals.length}`}
          </h1>
          <p className="text-sm text-muted-foreground">
            from {formatDate(start)} to {formatDate(end)}
          </p>
        </div>
        <div>
          {plan.meals.length === 0 ? (
            <p className="text-lg text-muted-foreground">No meals planned</p>
          ) : (
            <div className="mt-1">
              <PlannedMealsTable meals={plan.meals} />
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
