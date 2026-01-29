import { notFound } from "next/navigation";
import { getWeekPlanWithMeals, getAllMealsWithTags } from "../../actions";
import { EditPlanForm } from "./edit-plan-form";

interface EditPlanPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPlanPage({ params }: EditPlanPageProps) {
  const { id } = await params;
  const [plan, allMeals] = await Promise.all([
    getWeekPlanWithMeals(id),
    getAllMealsWithTags(),
  ]);

  if (!plan) {
    notFound();
  }

  return <EditPlanForm plan={plan} allMeals={allMeals} />;
}
