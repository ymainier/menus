"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { ArrowLeft, Trash2 } from "lucide-react";
import { updateTag, deleteTag } from "../../actions";
import type { Tag } from "../../actions";

interface EditTagFormProps {
  tag: Tag;
}

export function EditTagForm({ tag }: EditTagFormProps) {
  const router = useRouter();
  const [name, setName] = useState(tag.name);
  const [error, setError] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isSaving, startSaveTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    startSaveTransition(async () => {
      const result = await updateTag(tag.id, name);

      if (result.success) {
        router.push("/tags");
      } else {
        setError(result.error);
      }
    });
  };

  const handleDelete = () => {
    setError("");

    startDeleteTransition(async () => {
      const result = await deleteTag(tag.id);

      if (result.success) {
        router.push("/tags");
      } else {
        setError(result.error);
        setDeleteDialogOpen(false);
      }
    });
  };

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/tags">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Edit Tag</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tag name"
            autoFocus
          />
          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={isSaving || isDeleting}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/tags">Cancel</Link>
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
                <AlertDialogTitle>Delete tag?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete &quot;{tag.name}&quot;?
                  This will remove it from all associated meals.
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
    </>
  );
}
