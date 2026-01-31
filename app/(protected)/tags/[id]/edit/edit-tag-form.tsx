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
import { Ellipsis, List, Save, Trash2 } from "lucide-react";
import { ButtonGroup } from "@/components/ui/button-group";
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
            <Link href="/tags">
              <List className="h-4 w-4" />
              <span className="sr-only">List tags</span>
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
        </ButtonGroup>
      </div>
    </form>
  );
}
