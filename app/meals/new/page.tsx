import { getTags } from "@/app/tags/actions";
import { NewMealForm } from "./new-meal-form";

export default async function NewMealPage() {
  const tags = await getTags();

  return <NewMealForm tags={tags} />;
}
