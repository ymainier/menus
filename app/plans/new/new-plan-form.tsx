"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createWeekPlan } from "../actions";
import { useBreadcrumb } from "@/components/breadcrumb-context";

interface NewPlanFormProps {
  defaultWeek: string;
}

export function NewPlanForm({ defaultWeek }: NewPlanFormProps) {
  const router = useRouter();
  const [weekNumber, setWeekNumber] = useState(defaultWeek);
  const [error, setError] = useState("");
  const [isCreating, startTransition] = useTransition();
  const { setItems } = useBreadcrumb();

  useEffect(() => {
    setItems([{ label: "Plans", href: "/plans" }, { label: "New" }]);
    return () => setItems([]);
  }, [setItems]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      const result = await createWeekPlan(weekNumber);

      if (result.success) {
        router.push("/plans");
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          value={weekNumber}
          onChange={(e) => setWeekNumber(e.target.value)}
          placeholder="Week number (e.g., 2025-W04)"
          autoFocus
        />
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        <p className="text-sm text-muted-foreground mt-2">
          Use ISO 8601 format: YYYY-Www (e.g., 2025-W04)
        </p>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isCreating}>
          {isCreating ? "Creating..." : "Create Plan"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/plans">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
