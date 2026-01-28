import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Pencil } from "lucide-react";
import { getMeal } from "../actions";
import { DeleteMealButton } from "./delete-button";

interface MealPageProps {
  params: Promise<{ id: string }>;
}

export default async function MealPage({ params }: MealPageProps) {
  const { id } = await params;
  const meal = await getMeal(id);

  if (!meal) {
    notFound();
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/meals">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Meal</h1>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-sm text-muted-foreground">Name</label>
          <p className="text-lg font-medium">{meal.name}</p>
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Tags</label>
          <div className="flex flex-wrap gap-1 mt-1">
            {meal.tags.length > 0 ? (
              meal.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary">
                  {tag.name}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground text-sm">No tags</span>
            )}
          </div>
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Created</label>
          <p className="text-lg">{formatDate(meal.createdAt)}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/meals/${id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <DeleteMealButton id={id} name={meal.name} />
        </div>
      </div>
    </>
  );
}
