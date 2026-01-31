"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
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
import {
  Ellipsis,
  List,
  Save,
  Square,
  SquareCheck,
  Trash2,
} from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  updateWeekPlan,
  deleteWeekPlan,
  type WeekPlanWithMeals,
  type MealWithTags,
} from "../../actions";
import { CreateMealDialog } from "../../create-meal-dialog";
import type { Meal } from "@/app/(protected)/meals/actions";
import type { Tag } from "@/app/(protected)/tags/actions";

interface EditPlanFormProps {
  plan: WeekPlanWithMeals;
  allMeals: MealWithTags[];
  initialTags: Tag[];
}

export function EditPlanForm({
  plan,
  allMeals,
  initialTags,
}: EditPlanFormProps) {
  const router = useRouter();
  const [weekNumber, setWeekNumber] = useState(plan.weekNumber);
  const [selectedMealIdsSet, setSelectedMealIdsSet] = useState<Set<string>>(
    () => new Set(plan.meals.map((m) => m.mealId)),
  );
  const [meals, setMeals] = useState<MealWithTags[]>(allMeals);
  const [tags, setTags] = useState<Tag[]>(initialTags);
  const [filter, setFilter] = useState("");
  const [visibility, setVisibility] = useState<
    "all" | "selected" | "unselected"
  >("all");
  const [error, setError] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isSaving, startSaveTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const selectedMealIds = useMemo(
    () => Array.from(selectedMealIdsSet),
    [selectedMealIdsSet],
  );

  const filteredMeals = useMemo(() => {
    let result = meals;

    // Apply visibility filter
    if (visibility === "selected") {
      result = result.filter((meal) => selectedMealIdsSet.has(meal.id));
    } else if (visibility === "unselected") {
      result = result.filter((meal) => !selectedMealIdsSet.has(meal.id));
    }

    // Apply text search filter
    const searchTerm = filter.toLowerCase().trim();
    if (searchTerm) {
      result = result.filter((meal) => {
        const nameMatches = meal.name.toLowerCase().includes(searchTerm);
        const tagMatches = meal.tags.some((tag) =>
          tag.name.toLowerCase().includes(searchTerm),
        );
        return nameMatches || tagMatches;
      });
    }

    return result;
  }, [meals, filter, visibility, selectedMealIdsSet]);

  const handleMealCreated = useCallback(
    (meal: Meal) => {
      const mealWithTags: MealWithTags = {
        id: meal.id,
        name: meal.name,
        tags: meal.tags,
      };
      setMeals((prev) => {
        // Binary search insertion for sorted array
        const index = prev.findIndex(
          (m) => m.name.localeCompare(meal.name) > 0,
        );
        if (index === -1) return [...prev, mealWithTags];
        return [...prev.slice(0, index), mealWithTags, ...prev.slice(index)];
      });
      setSelectedMealIdsSet((prev) => new Set(prev).add(meal.id));
      router.refresh();
    },
    [router],
  );

  const handleTagCreated = useCallback((tag: Tag) => {
    setTags((prev) => {
      // Binary search insertion for sorted array
      const index = prev.findIndex((t) => t.name.localeCompare(tag.name) > 0);
      if (index === -1) return [...prev, tag];
      return [...prev.slice(0, index), tag, ...prev.slice(index)];
    });
  }, []);

  const handleToggleMeal = useCallback((mealId: string) => {
    setSelectedMealIdsSet((prev) => {
      const next = new Set(prev);
      if (next.has(mealId)) {
        next.delete(mealId);
      } else {
        next.add(mealId);
      }
      return next;
    });
  }, []);

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
          <ToggleGroup
            type="single"
            variant="outline"
            value={visibility}
            onValueChange={(value) =>
              value && setVisibility(value as "all" | "selected" | "unselected")
            }
          >
            <ToggleGroupItem value="all" aria-label="Show all meals">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="selected"
              aria-label="Show selected meals only"
            >
              <SquareCheck className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="unselected"
              aria-label="Show unselected meals only"
            >
              <Square className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
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
                        checked={selectedMealIdsSet.has(meal.id)}
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
