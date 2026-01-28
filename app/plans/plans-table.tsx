import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { WeekPlan } from "./actions";

interface PlansTableProps {
  plans: WeekPlan[];
}

export function PlansTable({ plans }: PlansTableProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.map((plan) => (
            <TableRow key={plan.id} className="relative has-focus-visible:outline has-focus-visible:outline-ring has-focus-visible:-outline-offset-2">
              <TableCell>
                <Link
                  href={`/plans/${plan.id}`}
                  className="font-medium hover:underline after:absolute after:inset-0 focus-visible:outline-none"
                >
                  {plan.weekNumber}
                </Link>
              </TableCell>
              <TableCell>{plan.mealCount}</TableCell>
              <TableCell>{formatDate(plan.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
