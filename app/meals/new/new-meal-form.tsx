"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { createMeal } from "../actions";
import { TagCloud } from "../tag-cloud";
import type { Tag } from "@/app/tags/actions";

interface NewMealFormProps {
  tags: Tag[];
}

export function NewMealForm({ tags }: NewMealFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isCreating, startTransition] = useTransition();

  const handleToggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
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
    <>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/meals">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">New Meal</h1>
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
          <Button type="submit" disabled={isCreating}>
            {isCreating ? "Creating..." : "Create Meal"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/meals">Cancel</Link>
          </Button>
        </div>
      </form>
    </>
  );
}
