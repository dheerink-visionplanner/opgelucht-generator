import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { feeds, newsItems } from "@/db/schema";
import type { Feed } from "@/lib/types/feed.types";
import type { CreateFeedInput } from "@/lib/types/feed.types";

export async function getAllFeeds(): Promise<Feed[]> {
  return db.select().from(feeds).orderBy(asc(feeds.label));
}

export async function createFeed(input: CreateFeedInput): Promise<Feed> {
  const existing = await db
    .select()
    .from(feeds)
    .where(eq(feeds.url, input.url))
    .limit(1);

  if (existing.length > 0) {
    throw new Error("DUPLICATE_URL");
  }

  const [created] = await db
    .insert(feeds)
    .values({ label: input.label, url: input.url })
    .returning();

  return created;
}

export async function deleteFeed(id: number): Promise<void> {
  await db.update(newsItems).set({ feedId: null }).where(eq(newsItems.feedId, id));
  const result = await db.delete(feeds).where(eq(feeds.id, id)).returning({ id: feeds.id });
  if (result.length === 0) {
    throw new Error("Feed niet gevonden");
  }
}
