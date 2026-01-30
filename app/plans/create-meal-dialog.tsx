"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { TagCloud } from "@/app/meals/tag-cloud";
import { CreateTagDialog } from "@/app/meals/create-tag-dialog";
import { createMeal, type Meal } from "@/app/meals/actions";
import type { Tag } from "@/app/tags/actions";

interface CreateMealDialogProps {
  tags: Tag[];
  onMealCreated: (meal: Meal) => void;
  onTagCreated: (tag: Tag) => void;
}

export function CreateMealDialog({
  tags,
  onMealCreated,
  onTagCreated,
}: CreateMealDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setName("");
      setSelectedTagIds([]);
      setError("");
    }
  };

  const handleToggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleTagCreated = (tag: Tag) => {
    onTagCreated(tag);
    setSelectedTagIds((prev) => [...prev, tag.id]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError("");

    startTransition(async () => {
      const result = await createMeal(name, selectedTagIds);

      if (result.success) {
        onMealCreated(result.data);
        setOpen(false);
        setName("");
        setSelectedTagIds([]);
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Plus className="size-4 mr-1" />
          Add Meal
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Meal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
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
                Tags (optional)
              </label>
              <TagCloud
                tags={tags}
                selectedTagIds={selectedTagIds}
                onToggleTag={handleToggleTag}
                action={<CreateTagDialog onTagCreated={handleTagCreated} />}
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
