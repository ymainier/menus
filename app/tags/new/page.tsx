"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { createTag } from "../actions";

export default function NewTagPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    setIsCreating(true);
    const result = await createTag(name);
    setIsCreating(false);

    if (result.success) {
      router.push("/tags");
    } else {
      setError(result.error);
    }
  };

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/tags">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">New Tag</h1>
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
          <Button type="submit" disabled={isCreating}>
            {isCreating ? "Creating..." : "Create Tag"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/tags">Cancel</Link>
          </Button>
        </div>
      </form>
    </>
  );
}
