import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Meal } from "./actions";

interface MealsTableProps {
  meals: Meal[];
}

export function MealsTable({ meals }: MealsTableProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (meals.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        No meals yet. Create your first meal.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {meals.map((meal) => (
            <TableRow key={meal.id} className="relative has-focus-visible:outline has-focus-visible:outline-ring has-focus-visible:-outline-offset-2">
              <TableCell>
                <Link
                  href={`/meals/${meal.id}`}
                  className="font-medium hover:underline after:absolute after:inset-0 focus-visible:outline-none"
                >
                  {meal.name}
                </Link>
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
              <TableCell>{formatDate(meal.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
