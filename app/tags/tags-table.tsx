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
import { Pencil, Trash2 } from "lucide-react";
import type { Tag } from "./actions";
import { deleteTag } from "./actions";

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
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tags.map((tag) => (
            <TagRow key={tag.id} tag={tag} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function TagRow({ tag }: { tag: Tag }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDeleting, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteTag(tag.id);

      if (result.success) {
        router.refresh();
      } else {
        setOpen(false);
      }
    });
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{tag.name}</TableCell>
      <TableCell>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/tags/${tag.id}/edit`}>
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit {tag.name}</span>
            </Link>
          </Button>
          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete {tag.name}</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete tag?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete &quot;{tag.name}&quot;? This
                  will remove it from all associated meals.
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
