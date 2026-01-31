import { getTags } from "@/app/(protected)/tags/actions";
import { NewMealForm } from "./new-meal-form";
import { SetBreadcrumb } from "@/components/set-breadcrumb";

export default async function NewMealPage() {
  const tags = await getTags();

  return (
    <>
      <SetBreadcrumb
        items={[{ label: "Meals", href: "/meals" }, { label: "New" }]}
      />
      <NewMealForm initialTags={tags} />
    </>
  );
}
