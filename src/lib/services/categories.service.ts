import { asc } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import type { Category } from "@/lib/types/category.types";

export async function getAllCategories(): Promise<Category[]> {
  return db
    .select()
    .from(categories)
    .orderBy(asc(categories.sortOrder), asc(categories.name));
}
