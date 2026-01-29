"use client";

import { useTransition } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { togglePlannedMealDone } from "../actions";

interface MealCheckboxProps {
  plannedMealId: string;
  done: boolean;
  mealName: string;
}

export function MealCheckbox({
  plannedMealId,
  done,
  mealName,
}: MealCheckboxProps) {
  const [isPending, startTransition] = useTransition();

  const handleCheckedChange = () => {
    startTransition(async () => {
      await togglePlannedMealDone(plannedMealId);
    });
  };

  return (
    <Checkbox
      id={plannedMealId}
      checked={done}
      onCheckedChange={handleCheckedChange}
      disabled={isPending}
      aria-label={`Mark ${mealName} as ${done ? "not done" : "done"}`}
    />
  );
}
