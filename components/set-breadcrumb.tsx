"use client";

import { useEffect, useRef } from "react";
import { useBreadcrumb, BreadcrumbItem } from "@/components/breadcrumb-context";

interface SetBreadcrumbProps {
  items: BreadcrumbItem[];
}

export function SetBreadcrumb({ items }: SetBreadcrumbProps) {
  const { setItems } = useBreadcrumb();
  const prevItemsRef = useRef<string>("");
  const itemsKey = JSON.stringify(items);

  useEffect(() => {
    if (prevItemsRef.current !== itemsKey) {
      prevItemsRef.current = itemsKey;
      setItems(items);
    }
    return () => setItems([]);
  }, [itemsKey, setItems, items]);

  return null;
}
