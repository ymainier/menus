import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Tag } from "./actions";

interface TagsTableProps {
  tags: Tag[];
}

export function TagsTable({ tags }: TagsTableProps) {
  if (tags.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        No tags yet. Create your first tag.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tags.map((tag) => (
            <TableRow key={tag.id} className="relative has-focus-visible:outline has-focus-visible:outline-ring has-focus-visible:-outline-offset-2">
              <TableCell>
                <Link
                  href={`/tags/${tag.id}`}
                  className="font-medium hover:underline after:absolute after:inset-0 focus-visible:outline-none"
                >
                  {tag.name}
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
