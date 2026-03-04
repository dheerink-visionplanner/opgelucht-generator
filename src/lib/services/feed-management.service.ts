import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { feeds, newsItems } from "@/db/schema";
import type { Feed } from "@/lib/types/feed.types";

export async function getAllFeeds(): Promise<Feed[]> {
  return db.select().from(feeds).orderBy(asc(feeds.label));
}

export async function deleteFeed(id: number): Promise<void> {
  await db.update(newsItems).set({ feedId: null }).where(eq(newsItems.feedId, id));
  const result = await db.delete(feeds).where(eq(feeds.id, id)).returning({ id: feeds.id });
  if (result.length === 0) {
    throw new Error("Feed niet gevonden");
  }
}
