import { notFound } from "next/navigation";
import { getTags } from "@/app/tags/actions";
import { getMeal } from "../../actions";
import { EditMealForm } from "./edit-meal-form";

interface EditMealPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditMealPage({ params }: EditMealPageProps) {
  const { id } = await params;
  const [meal, tags] = await Promise.all([getMeal(id), getTags()]);

  if (!meal) {
    notFound();
  }

  return <EditMealForm meal={meal} tags={tags} />;
}
