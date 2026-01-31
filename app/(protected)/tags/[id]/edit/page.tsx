import { notFound } from "next/navigation";
import { getTag } from "../../actions";
import { EditTagForm } from "./edit-tag-form";
import { SetBreadcrumb } from "@/components/set-breadcrumb";

interface EditTagPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTagPage({ params }: EditTagPageProps) {
  const { id } = await params;
  const tag = await getTag(id);

  if (!tag) {
    notFound();
  }

  return (
    <>
      <SetBreadcrumb
        items={[{ label: "Tags", href: "/tags" }, { label: "Edit" }]}
      />
      <EditTagForm tag={tag} />
    </>
  );
}
