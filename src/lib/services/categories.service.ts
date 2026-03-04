import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import type { Category, UpdateCategoryInput } from "@/lib/types/category.types";

export async function getAllCategories(): Promise<Category[]> {
  return db
    .select()
    .from(categories)
    .orderBy(asc(categories.sortOrder), asc(categories.name));
}

export async function updateCategory(
  id: number,
  input: UpdateCategoryInput,
): Promise<Category> {
  let updatedRows: Category[];
  try {
    updatedRows = await db
      .update(categories)
      .set({ name: input.name, updatedAt: sql`(datetime('now'))` })
      .where(eq(categories.id, id))
      .returning();
  } catch (error) {
    const message =
      error instanceof Error ? error.message.toLowerCase() : String(error);
    if (message.includes("unique") || message.includes("unique constraint")) {
      throw new Error("Categorie bestaat al");
    }
    throw error;
  }

  if (updatedRows.length === 0) {
    throw new Error("Categorie niet gevonden");
  }

  return updatedRows[0];
}
