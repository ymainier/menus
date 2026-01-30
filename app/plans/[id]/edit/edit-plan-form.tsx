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
import { Ellipsis, List, Save, Trash2 } from "lucide-react";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  updateWeekPlan,
  deleteWeekPlan,
  type WeekPlanWithMeals,
  type MealWithTags,
} from "../../actions";
import { CreateMealDialog } from "../../create-meal-dialog";
import type { Meal } from "@/app/meals/actions";
import type { Tag } from "@/app/tags/actions";

interface EditPlanFormProps {
  plan: WeekPlanWithMeals;
  allMeals: MealWithTags[];
  initialTags: Tag[];
}

export function EditPlanForm({ plan, allMeals, initialTags }: EditPlanFormProps) {
  const router = useRouter();
  const [weekNumber, setWeekNumber] = useState(plan.weekNumber);
  const [selectedMealIds, setSelectedMealIds] = useState<string[]>(
    plan.meals.map((m) => m.mealId),
  );
  const [meals, setMeals] = useState<MealWithTags[]>(allMeals);
  const [tags, setTags] = useState<Tag[]>(initialTags);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isSaving, startSaveTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const filteredMeals = useMemo(() => {
    const searchTerm = filter.toLowerCase().trim();
    if (!searchTerm) return meals;

    return meals.filter((meal) => {
      const nameMatches = meal.name.toLowerCase().includes(searchTerm);
      const tagMatches = meal.tags.some((tag) =>
        tag.name.toLowerCase().includes(searchTerm),
      );
      return nameMatches || tagMatches;
    });
  }, [meals, filter]);

  const handleMealCreated = (meal: Meal) => {
    const mealWithTags: MealWithTags = {
      id: meal.id,
      name: meal.name,
      tags: meal.tags,
    };
    setMeals((prev) =>
      [...prev, mealWithTags].sort((a, b) => a.name.localeCompare(b.name))
    );
    setSelectedMealIds((prev) => [...prev, meal.id]);
    router.refresh();
  };

  const handleTagCreated = (tag: Tag) => {
    setTags((prev) =>
      [...prev, tag].sort((a, b) => a.name.localeCompare(b.name))
    );
  };

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
        <div className="flex gap-2 mb-2">
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by name or tag..."
            className="flex-1"
          />
          <CreateMealDialog
            tags={tags}
            onMealCreated={handleMealCreated}
            onTagCreated={handleTagCreated}
          />
        </div>
        <div className="border rounded-md max-h-80 overflow-y-auto">
          {meals.length === 0 ? (
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
        <ButtonGroup>
          <Button
            type="submit"
            variant="outline"
            disabled={isSaving || isDeleting}
            className="cursor-pointer"
          >
            {isSaving ? (
              <>
                <Ellipsis className="h-4 w-4" />
                <span className="sr-only">Saving</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span className="sr-only">Save</span>
              </>
            )}
          </Button>
          <Button type="button" variant="outline" size="icon" asChild>
            <Link href="/plans">
              <List className="h-4 w-4" />
              <span className="sr-only">View plans</span>
            </Link>
          </Button>
          <AlertDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
          >
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="cursor-pointer"
                disabled={isSaving || isDeleting}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete {plan.weekNumber}</span>
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
        </ButtonGroup>
      </div>
    </form>
  );
}
