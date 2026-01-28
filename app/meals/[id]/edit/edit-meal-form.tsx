"use client";

import { useState } from "react";
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
    meal.tags.map((t) => t.id)
  );
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleToggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    setIsSaving(true);
    const result = await updateMeal(meal.id, name, selectedTagIds);
    setIsSaving(false);

    if (result.success) {
      router.push(`/meals/${meal.id}`);
    } else {
      setError(result.error);
    }
  };

  const handleDelete = async () => {
    setError("");
    setIsDeleting(true);
    const result = await deleteMeal(meal.id);
    setIsDeleting(false);

    if (result.success) {
      router.push("/meals");
    } else {
      setError(result.error);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/meals/${meal.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Edit Meal</h1>
      </div>
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
          <label className="text-sm text-muted-foreground mb-2 block">
            Tags
          </label>
          <TagCloud
            tags={tags}
            selectedTagIds={selectedTagIds}
            onToggleTag={handleToggleTag}
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={isSaving || isDeleting}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href={`/meals/${meal.id}`}>Cancel</Link>
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
                <AlertDialogTitle>Delete meal?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete &quot;{meal.name}&quot;?
                  This action cannot be undone.
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
