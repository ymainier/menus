import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getWeekPlan } from "../actions";
import { DeletePlanButton } from "./delete-button";
import { SetBreadcrumb } from "@/components/set-breadcrumb";

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
  const plan = await getWeekPlan(id);

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
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Meals</label>
          <p className="text-lg">{plan.mealCount}</p>
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
