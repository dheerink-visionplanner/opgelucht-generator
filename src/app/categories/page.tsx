import { getAllCategories } from "@/lib/services/categories.service";
import { CategoriesPageClient } from "./page.client";

export default async function CategoriesPage() {
  const categories = await getAllCategories();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="mb-8 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Categorieën
        </h1>

        <CategoriesPageClient categories={categories} />
      </main>
    </div>
  );
}
