"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createTag } from "../actions";
import { useBreadcrumb } from "@/components/breadcrumb-context";

export default function NewTagPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isCreating, startTransition] = useTransition();
  const { setItems } = useBreadcrumb();

  useEffect(() => {
    setItems([{ label: "Tags", href: "/tags" }, { label: "New" }]);
    return () => setItems([]);
  }, [setItems]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      const result = await createTag(name);

      if (result.success) {
        router.push("/tags");
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
          placeholder="Tag name"
          autoFocus
        />
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isCreating}>
          {isCreating ? "Creating..." : "Create Tag"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/tags">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
