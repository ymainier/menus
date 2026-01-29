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
import { updateMeal, deleteMeal } from "../../actions";
import type { Meal } from "../../actions";
import { TagCloud } from "../../tag-cloud";
import type { Tag } from "@/app/tags/actions";

interface EditMealFormProps {
  meal: Meal;
  tags: Tag[];
}

export function EditMealForm({ meal, tags }: EditMealFormProps) {
  const router = useRouter();
  const [name, setName] = useState(meal.name);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    meal.tags.map((t) => t.id),
  );
  const [error, setError] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isSaving, startSaveTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const handleToggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    startSaveTransition(async () => {
      const result = await updateMeal(meal.id, name, selectedTagIds);

      if (result.success) {
        router.push("/meals");
      } else {
        setError(result.error);
      }
    });
  };

  const handleDelete = () => {
    setError("");

    startDeleteTransition(async () => {
      const result = await deleteMeal(meal.id);

      if (result.success) {
        router.push("/meals");
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
          placeholder="Meal name"
          autoFocus
        />
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </div>
      <div>
        <label className="text-sm text-muted-foreground mb-2 block">Tags</label>
        <TagCloud
          tags={tags}
          selectedTagIds={selectedTagIds}
          onToggleTag={handleToggleTag}
        />
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
            <Link href="/meals">
              <List className="h-4 w-4" />
              <span className="sr-only">List meals</span>
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
        </ButtonGroup>
      </div>
    </form>
  );
}
