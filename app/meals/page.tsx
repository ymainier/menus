import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getMeals } from "./actions";
import { MealsTable } from "./meals-table";
import { SetBreadcrumb } from "@/components/set-breadcrumb";

export default async function MealsPage() {
  const meals = await getMeals();

  return (
    <>
      <SetBreadcrumb items={[{ label: "Meals" }]} />
      <div className="flex items-center justify-between mb-6">
        <Button asChild>
          <Link href="/meals/new">
            <Plus className="mr-2 h-4 w-4" />
            New Meal
          </Link>
        </Button>
      </div>
      <MealsTable meals={meals} />
    </>
  );
}
