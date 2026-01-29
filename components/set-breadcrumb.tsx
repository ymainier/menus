"use client";

import { useEffect } from "react";
import { useBreadcrumb, BreadcrumbItem } from "@/components/breadcrumb-context";

interface SetBreadcrumbProps {
  items: BreadcrumbItem[];
}

export function SetBreadcrumb({ items }: SetBreadcrumbProps) {
  const { setItems } = useBreadcrumb();
  const itemsKey = JSON.stringify(items);

  useEffect(() => {
    setItems(items);
    return () => setItems([]);
  }, [itemsKey, items, setItems]);

  return null;
}
