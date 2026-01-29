import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getTags } from "./actions";
import { TagsTable } from "./tags-table";
import { SetBreadcrumb } from "@/components/set-breadcrumb";

export default async function TagsPage() {
  const tags = await getTags();

  return (
    <>
      <SetBreadcrumb items={[{ label: "Tags" }]} />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tags</h1>
        <Button asChild>
          <Link href="/tags/new">
            <Plus className="mr-2 h-4 w-4" />
            New Tag
          </Link>
        </Button>
      </div>
      <TagsTable tags={tags} />
    </>
  );
}
