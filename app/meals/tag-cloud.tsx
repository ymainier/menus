"use client";

import { Badge } from "@/components/ui/badge";
import type { Tag } from "./actions";

interface TagCloudProps {
  tags: Tag[];
  selectedTagIds: string[];
  onToggleTag: (tagId: string) => void;
}

export function TagCloud({ tags, selectedTagIds, onToggleTag }: TagCloudProps) {
  if (tags.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No tags available. Create tags first.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const isSelected = selectedTagIds.includes(tag.id);
        return (
          <Badge
            key={tag.id}
            variant={isSelected ? "default" : "outline"}
            className="cursor-pointer select-none"
            onClick={() => onToggleTag(tag.id)}
          >
            {tag.name}
          </Badge>
        );
      })}
    </div>
  );
}
