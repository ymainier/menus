"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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
import { Eye, Pencil, Trash2 } from "lucide-react";
import type { WeekPlan } from "./actions";
import { deleteWeekPlan } from "./actions";

interface PlansTableProps {
  plans: WeekPlan[];
}

export function PlansTable({ plans }: PlansTableProps) {
  if (plans.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        No plans yet. Create your first week plan.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Week</TableHead>
            <TableHead>Meals</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.map((plan) => (
            <PlanRow key={plan.id} plan={plan} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function PlanRow({ plan }: { plan: WeekPlan }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDeleting, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteWeekPlan(plan.id);

      if (result.success) {
        router.refresh();
      } else {
        setOpen(false);
      }
    });
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{plan.weekNumber}</TableCell>
      <TableCell>{plan.mealCount}</TableCell>
      <TableCell>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/plans/${plan.id}`}>
              <Eye className="h-4 w-4" />
              <span className="sr-only">View {plan.weekNumber}</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/plans/${plan.id}/edit`}>
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit {plan.weekNumber}</span>
            </Link>
          </Button>
          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete {plan.weekNumber}</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete plan?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete the plan for &quot;{plan.weekNumber}&quot;? This
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
}
