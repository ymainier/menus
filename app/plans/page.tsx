import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getWeekPlans } from "./actions";
import { PlansTable } from "./plans-table";

export default async function PlansPage() {
  const plans = await getWeekPlans();

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Plans</h1>
        <Button asChild>
          <Link href="/plans/new">
            <Plus className="mr-2 h-4 w-4" />
            New Plan
          </Link>
        </Button>
      </div>
      <PlansTable plans={plans} />
    </>
  );
}
