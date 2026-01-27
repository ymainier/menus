"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createMeal, updateMeal, deleteMeal, type Meal } from "./actions";

type MealsCommandProps = {
  initialMeals: Meal[];
};

export function MealsCommand({ initialMeals }: MealsCommandProps) {
  const [meals, setMeals] = useState<Meal[]>(initialMeals);
  const [search, setSearch] = useState("");
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newMealName, setNewMealName] = useState("");
  const [editMealName, setEditMealName] = useState("");
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  // Update meals when initialMeals changes (from revalidation)
  useEffect(() => {
    setMeals(initialMeals);
  }, [initialMeals]);

  // Focus command input on Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleAddMeal = () => {
    if (!newMealName.trim()) return;

    startTransition(async () => {
      const result = await createMeal(newMealName);
      if (result.success) {
        toast.success(`"${result.data.name}" added`);
        setNewMealName("");
        setShowAddDialog(false);
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleEditMeal = () => {
    if (!selectedMeal || !editMealName.trim()) return;

    startTransition(async () => {
      const result = await updateMeal(selectedMeal.id, editMealName);
      if (result.success) {
        toast.success(`Meal renamed to "${result.data.name}"`);
        setShowEditDialog(false);
        setSelectedMeal(null);
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleDeleteMeal = () => {
    if (!selectedMeal) return;

    startTransition(async () => {
      const result = await deleteMeal(selectedMeal.id);
      if (result.success) {
        toast.success(`"${selectedMeal.name}" deleted`);
        setShowDeleteDialog(false);
        setSelectedMeal(null);
      } else {
        toast.error(result.error);
      }
    });
  };

  const openEditDialog = (meal: Meal) => {
    setSelectedMeal(meal);
    setEditMealName(meal.name);
    setShowEditDialog(true);
  };

  const openDeleteDialog = (meal: Meal) => {
    setSelectedMeal(meal);
    setShowDeleteDialog(true);
  };

  return (
    <>
      <Command className="rounded-lg border shadow-md">
        <CommandInput
          ref={inputRef}
          placeholder="Search meals..."
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          <CommandEmpty>No meals found.</CommandEmpty>
          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => setShowAddDialog(true)}>
              <span className="mr-2">+</span>
              Add new meal...
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading={`Meals (${meals.length})`}>
            {meals.map((meal) => (
              <CommandItem
                key={meal.id}
                value={meal.name}
                className="flex items-center justify-between"
              >
                <span>{meal.name}</span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditDialog(meal);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeleteDialog(meal);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>

      {/* Keyboard hint */}
      <p className="text-sm text-muted-foreground mt-2 text-center">
        Press <kbd className="px-1.5 py-0.5 rounded border bg-muted">⌘K</kbd> to
        focus search
      </p>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add new meal</DialogTitle>
            <DialogDescription>
              Enter a name for the new meal.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Meal name"
            value={newMealName}
            onChange={(e) => setNewMealName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAddMeal();
              }
            }}
            autoFocus
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleAddMeal} disabled={isPending}>
              {isPending ? "Adding..." : "Add meal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit meal</DialogTitle>
            <DialogDescription>
              Change the name of &quot;{selectedMeal?.name}&quot;.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Meal name"
            value={editMealName}
            onChange={(e) => setEditMealName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleEditMeal();
              }
            }}
            autoFocus
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleEditMeal} disabled={isPending}>
              {isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete meal?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedMeal?.name}&quot;?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMeal}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
