import { getAllCategories } from "@/lib/services/categories.service";
import { AddCategoryForm } from "@/components/categories/add-category-form";

export default async function CategoriesPage() {
  const categories = await getAllCategories();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="mb-8 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Categorieën
        </h1>

        {categories.length === 0 ? (
          <p className="text-zinc-500 dark:text-zinc-400">
            Geen categorieën gevonden.
          </p>
        ) : (
          <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
            {categories.map((category) => (
              <li
                key={category.id}
                className="px-6 py-4 text-zinc-900 dark:text-zinc-100"
              >
                {category.name}
              </li>
            ))}
          </ul>
        )}

        <AddCategoryForm />
      </main>
    </div>
  );
}
