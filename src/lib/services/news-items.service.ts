import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { newsItems } from "@/db/schema";
import type { NewsItem } from "@/lib/types/news-item.types";

export async function getUnprocessedNewsItems(): Promise<NewsItem[]> {
  return db
    .select()
    .from(newsItems)
    .where(eq(newsItems.status, "new"))
    .orderBy(desc(newsItems.publicationDate), desc(newsItems.createdAt));
}
