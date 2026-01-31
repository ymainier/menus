"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createMeal } from "../actions";
import { TagCloud } from "../tag-cloud";
import { CreateTagDialog } from "../create-tag-dialog";
import type { Tag } from "@/app/(protected)/tags/actions";

interface NewMealFormProps {
  initialTags: Tag[];
}

export function NewMealForm({ initialTags }: NewMealFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [tags, setTags] = useState<Tag[]>(initialTags);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isCreating, startTransition] = useTransition();

  const handleTagCreated = (tag: Tag) => {
    setTags((prev) => [...prev, tag].sort((a, b) => a.name.localeCompare(b.name)));
    setSelectedTagIds((prev) => [...prev, tag.id]);
    router.refresh();
  };

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

    startTransition(async () => {
      const result = await createMeal(name, selectedTagIds);

      if (result.success) {
        router.push("/meals");
      } else {
        setError(result.error);
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
          action={<CreateTagDialog onTagCreated={handleTagCreated} />}
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isCreating}>
          {isCreating ? "Creating..." : "Create Meal"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/meals">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
