"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { createWeekPlan } from "../actions";
import { useBreadcrumb } from "@/components/breadcrumb-context";

function getCurrentWeek(): string {
  const now = new Date();
  const year = now.getFullYear();
  const oneJan = new Date(year, 0, 1);
  const numberOfDays = Math.floor(
    (now.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000),
  );
  const weekNumber = Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
  return `${year}-W${weekNumber.toString().padStart(2, "0")}`;
}

export default function NewPlanPage() {
  const router = useRouter();
  const [weekNumber, setWeekNumber] = useState(() => getCurrentWeek());
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
