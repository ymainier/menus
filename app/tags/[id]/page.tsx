import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil } from "lucide-react";
import { getTag } from "../actions";
import { DeleteTagButton } from "./delete-button";

interface TagPageProps {
  params: Promise<{ id: string }>;
}

export default async function TagPage({ params }: TagPageProps) {
  const { id } = await params;
  const tag = await getTag(id);

  if (!tag) {
    notFound();
  }

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/tags">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Tag</h1>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-sm text-muted-foreground">Name</label>
          <p className="text-lg font-medium">{tag.name}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/tags/${id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <DeleteTagButton id={id} name={tag.name} />
        </div>
      </div>
    </>
  );
}
