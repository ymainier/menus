"use client";

import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MealCheckbox } from "@/app/(protected)/plans/[id]/meal-checkbox";

interface PlannedMeal {
  id: string;
  mealName: string;
  done: boolean;
  tags: { id: string; name: string }[];
}

interface PlannedMealsTableProps {
  meals: PlannedMeal[];
}

export const PlannedMealsTable = memo(function PlannedMealsTable({ meals }: PlannedMealsTableProps) {
  return (
    <div className="border rounded-md overflow-hidden">
      <Table className="table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead className="w-1/2">Name</TableHead>
            <TableHead>Tags</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {meals.map((meal) => (
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
                <div className="flex gap-1 overflow-hidden">
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
  );
});
