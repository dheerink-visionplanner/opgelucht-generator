import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import type { Category } from "@/lib/types/category.types";

export async function getAllCategories(): Promise<Category[]> {
  return db
    .select()
    .from(categories)
    .orderBy(asc(categories.sortOrder), asc(categories.name));
}

export async function getCategoryById(
  id: number
): Promise<Category | null> {
  const rows = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id));
  return rows[0] ?? null;
}

export async function getCategoryArticleCount(
  _id: number
): Promise<number> {
  // No articles table exists yet; return 0 as a safe default.
  return 0;
}

export async function deleteCategory(id: number): Promise<void> {
  const existing = await getCategoryById(id);
  if (!existing) {
    throw new Error("Categorie niet gevonden");
  }
  await db.delete(categories).where(eq(categories.id, id));
}
