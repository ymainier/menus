"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { createWeekPlan } from "../actions";

function getCurrentWeek(): string {
  const now = new Date();
  const year = now.getFullYear();
  const oneJan = new Date(year, 0, 1);
  const numberOfDays = Math.floor(
    (now.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000)
  );
  const weekNumber = Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
  return `${year}-W${weekNumber.toString().padStart(2, "0")}`;
}

export default function NewPlanPage() {
  const router = useRouter();
  const [weekNumber, setWeekNumber] = useState(getCurrentWeek());
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    setIsCreating(true);
    const result = await createWeekPlan(weekNumber);
    setIsCreating(false);

    if (result.success) {
      router.push("/plans");
    } else {
      setError(result.error);
    }
  };

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/plans">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">New Plan</h1>
      </div>
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
    </>
  );
}
