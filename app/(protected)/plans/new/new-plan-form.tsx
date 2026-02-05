"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createWeekPlan, generateWeekPlan } from "../actions";
import { useBreadcrumb } from "@/components/breadcrumb-context";
import { toast } from "sonner";

interface NewPlanFormProps {
  defaultWeek: string;
}

type ActiveAction = "create" | "winter" | "summer" | null;

export function NewPlanForm({ defaultWeek }: NewPlanFormProps) {
  const router = useRouter();
  const [weekNumber, setWeekNumber] = useState(defaultWeek);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [activeAction, setActiveAction] = useState<ActiveAction>(null);
  const { setItems } = useBreadcrumb();

  useEffect(() => {
    setItems([{ label: "Plans", href: "/plans" }, { label: "New" }]);
    return () => setItems([]);
  }, [setItems]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setActiveAction("create");

    startTransition(async () => {
      const result = await createWeekPlan(weekNumber);

      if (result.success) {
        router.push(`/plans/${result.data.id}/edit`);
      } else {
        setError(result.error);
        setActiveAction(null);
      }
    });
  };

  const handleGenerate = (presetKey: "winter" | "summer") => {
    setError("");
    setActiveAction(presetKey);

    startTransition(async () => {
      const result = await generateWeekPlan(weekNumber, presetKey);

      if (result.success) {
        for (const warning of result.data.warnings) {
          toast.warning(warning);
        }
        router.push(`/plans/${result.data.id}/edit`);
      } else {
        setError(result.error);
        setActiveAction(null);
      }
    });
  };

  const buttonLabel = (action: ActiveAction, defaultLabel: string) => {
    if (!isPending || activeAction !== action) return defaultLabel;
    return action === "create" ? "Creating..." : "Generating...";
  };

  return (
    <form onSubmit={handleCreate} className="space-y-4">
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
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={isPending}
          onClick={() => handleGenerate("winter")}
        >
          {buttonLabel("winter", "Generate Winter")}
        </Button>
        <Button
          type="button"
          disabled={isPending}
          onClick={() => handleGenerate("summer")}
        >
          {buttonLabel("summer", "Generate Summer")}
        </Button>
        <Button type="submit" variant="outline" disabled={isPending}>
          {buttonLabel("create", "Create Empty")}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/plans">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
