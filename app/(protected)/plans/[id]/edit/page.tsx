import { notFound } from "next/navigation";
import { getWeekPlanWithMeals, getAllMealsWithTags } from "../../actions";
import { getTags } from "@/app/(protected)/tags/actions";
import { EditPlanForm } from "./edit-plan-form";
import { SetBreadcrumb } from "@/components/set-breadcrumb";

interface EditPlanPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPlanPage({ params }: EditPlanPageProps) {
  const { id } = await params;
  const [plan, allMeals, tags] = await Promise.all([
    getWeekPlanWithMeals(id),
    getAllMealsWithTags(),
    getTags(),
  ]);

  if (!plan) {
    notFound();
  }

  return (
    <>
      <SetBreadcrumb
        items={[{ label: "Plans", href: "/plans" }, { label: "Edit" }]}
      />
      <EditPlanForm plan={plan} allMeals={allMeals} initialTags={tags} />
    </>
  );
}
