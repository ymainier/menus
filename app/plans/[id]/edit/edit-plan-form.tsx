"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import {
  updateWeekPlan,
  deleteWeekPlan,
  type WeekPlanWithMeals,
  type MealWithTags,
} from "../../actions";

interface EditPlanFormProps {
  plan: WeekPlanWithMeals;
  allMeals: MealWithTags[];
}

export function EditPlanForm({ plan, allMeals }: EditPlanFormProps) {
  const router = useRouter();
  const [weekNumber, setWeekNumber] = useState(plan.weekNumber);
  const [selectedMealIds, setSelectedMealIds] = useState<string[]>(
    plan.meals.map((m) => m.mealId),
  );
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isSaving, startSaveTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const filteredMeals = useMemo(() => {
    const searchTerm = filter.toLowerCase().trim();
    if (!searchTerm) return allMeals;

    return allMeals.filter((meal) => {
      const nameMatches = meal.name.toLowerCase().includes(searchTerm);
      const tagMatches = meal.tags.some((tag) =>
        tag.name.toLowerCase().includes(searchTerm),
      );
      return nameMatches || tagMatches;
    });
  }, [allMeals, filter]);

  const handleToggleMeal = (mealId: string) => {
    setSelectedMealIds((prev) =>
      prev.includes(mealId)
        ? prev.filter((id) => id !== mealId)
        : [...prev, mealId],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    startSaveTransition(async () => {
      const result = await updateWeekPlan(plan.id, weekNumber, selectedMealIds);

      if (result.success) {
        router.push("/plans");
      } else {
        setError(result.error);
      }
    });
  };

  const handleDelete = () => {
    setError("");

    startDeleteTransition(async () => {
      const result = await deleteWeekPlan(plan.id);

      if (result.success) {
        router.push("/plans");
      } else {
        setError(result.error);
        setDeleteDialogOpen(false);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm text-muted-foreground mb-2 block">
          Week Number (ISO 8601 format)
        </label>
        <Input
          value={weekNumber}
          onChange={(e) => setWeekNumber(e.target.value)}
          placeholder="e.g., 2025-W04"
          autoFocus
        />
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </div>
      <div>
        <label className="text-sm text-muted-foreground mb-2 block">
          Meals ({selectedMealIds.length} selected)
        </label>
        <Input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter by name or tag..."
          className="mb-2"
        />
        <div className="border rounded-md max-h-80 overflow-y-auto">
          {allMeals.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4">
              No meals available. Create some meals first.
            </p>
          ) : filteredMeals.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4">
              No meals match the filter.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Tags</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMeals.map((meal) => (
                  <TableRow key={meal.id}>
                    <TableCell>
                      <Checkbox
                        id={meal.id}
                        checked={selectedMealIds.includes(meal.id)}
                        onCheckedChange={() => handleToggleMeal(meal.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <label
                        htmlFor={meal.id}
                        className="cursor-pointer select-none"
                      >
                        {meal.name}
                      </label>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {meal.tags.map((tag) => (
                          <Badge
                            key={tag.id}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isSaving || isDeleting}>
          {isSaving ? "Saving..." : "Save"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/plans">Cancel</Link>
        </Button>
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="destructive"
              disabled={isSaving || isDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete plan?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the plan for week &quot;
                {plan.weekNumber}&quot;? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </form>
  );
}
