"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Trash2 } from "lucide-react";
import { getTag, updateTag, deleteTag } from "../../actions";

interface EditTagPageProps {
  params: Promise<{ id: string }>;
}

export default function EditTagPage({ params }: EditTagPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [name, setName] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    async function loadTag() {
      const tag = await getTag(id);
      if (tag) {
        setName(tag.name);
        setOriginalName(tag.name);
      }
      setIsLoading(false);
    }
    loadTag();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    setIsSaving(true);
    const result = await updateTag(id, name);
    setIsSaving(false);

    if (result.success) {
      router.push(`/tags/${id}`);
    } else {
      setError(result.error);
    }
  };

  const handleDelete = async () => {
    setError("");
    setIsDeleting(true);
    const result = await deleteTag(id);
    setIsDeleting(false);

    if (result.success) {
      router.push("/tags");
    } else {
      setError(result.error);
      setDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return <p className="text-muted-foreground">Loading...</p>;
  }

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/tags/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Edit Tag</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tag name"
            autoFocus
          />
          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={isSaving || isDeleting}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href={`/tags/${id}`}>Cancel</Link>
          </Button>
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="destructive"
                disabled={isSaving || isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete tag?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete &quot;{originalName}&quot;?
                  This will remove it from all associated meals.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </form>
    </>
  );
}
