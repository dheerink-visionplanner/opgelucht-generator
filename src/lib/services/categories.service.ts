import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import type { Category } from "@/lib/types/category.types";
import type { CreateCategoryInput } from "@/lib/types/category.types";

export async function getAllCategories(): Promise<Category[]> {
  return db
    .select()
    .from(categories)
    .orderBy(asc(categories.sortOrder), asc(categories.name));
}

export async function createCategory(
  input: CreateCategoryInput
): Promise<Category> {
  const existing = await db
    .select()
    .from(categories)
    .where(eq(categories.name, input.name));

  if (existing.length > 0) {
    throw new Error(`Categorie met naam "${input.name}" bestaat al`);
  }

  const [created] = await db
    .insert(categories)
    .values({ name: input.name })
    .returning();

  return created;
}
