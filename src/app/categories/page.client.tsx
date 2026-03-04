"use client";

import { useRouter } from "next/navigation";
import { DeleteCategoryButton } from "@/components/categories/delete-category-button";
import type { Category } from "@/lib/types/category.types";

interface CategoriesPageClientProps {
  categories: Category[];
}

export function CategoriesPageClient({ categories }: CategoriesPageClientProps) {
  const router = useRouter();

  if (categories.length === 0) {
    return (
      <p className="text-zinc-500 dark:text-zinc-400">
        Geen categorieën gevonden.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
      {categories.map((category) => (
        <li
          key={category.id}
          className="flex items-center justify-between px-6 py-4 text-zinc-900 dark:text-zinc-100"
        >
          <span>{category.name}</span>
          <DeleteCategoryButton
            categoryId={category.id}
            categoryName={category.name}
            onDeleted={() => router.refresh()}
          />
        </li>
      ))}
    </ul>
  );
}
