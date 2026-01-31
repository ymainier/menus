"use client";

import { Badge } from "@/components/ui/badge";
import type { Tag } from "./actions";

interface TagCloudProps {
  tags: Tag[];
  selectedTagIds: string[];
  onToggleTag: (tagId: string) => void;
  action?: React.ReactNode;
}

export function TagCloud({
  tags,
  selectedTagIds,
  onToggleTag,
  action,
}: TagCloudProps) {
  if (tags.length === 0 && !action) {
    return (
      <p className="text-muted-foreground text-sm">
        No tags available. Create tags first.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Tags">
      {tags.map((tag) => {
        const isSelected = selectedTagIds.includes(tag.id);
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => onToggleTag(tag.id)}
            aria-pressed={isSelected}
          >
            <Badge
              variant={isSelected ? "default" : "outline"}
              className="cursor-pointer select-none"
            >
              {tag.name}
            </Badge>
          </button>
        );
      })}
      {action}
    </div>
  );
}
