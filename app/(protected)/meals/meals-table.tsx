"use client";

import { memo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Pencil, Trash2 } from "lucide-react";
import type { Meal } from "./actions";
import { deleteMeal } from "./actions";

interface MealsTableProps {
  meals: Meal[];
}

export function MealsTable({ meals }: MealsTableProps) {
  if (meals.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        No meals yet. Create your first meal.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table className="table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/2">Name</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead className="w-25">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {meals.map((meal) => (
            <MealRow key={meal.id} meal={meal} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

const MealRow = memo(function MealRow({ meal }: { meal: Meal }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDeleting, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteMeal(meal.id);

      if (result.success) {
        router.refresh();
      } else {
        setOpen(false);
      }
    });
  };

  return (
    <TableRow>
      <TableCell className="font-medium whitespace-normal">
        {meal.name}
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {meal.tags.map((tag) => (
            <Badge key={tag.id} variant="secondary">
              {tag.name}
            </Badge>
          ))}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/meals/${meal.id}/edit`}>
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit {meal.name}</span>
            </Link>
          </Button>
          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="cursor-pointer">
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete {meal.name}</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete meal?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete &quot;{meal.name}&quot;? This
                  action cannot be undone.
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
      </TableCell>
    </TableRow>
  );
});
