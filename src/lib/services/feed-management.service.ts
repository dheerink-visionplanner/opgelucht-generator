import { asc, eq, and, ne } from "drizzle-orm";
import { db } from "@/db";
import { feeds } from "@/db/schema";
import type { Feed } from "@/lib/types/feed.types";
import type { UpdateFeedInput } from "@/lib/types/feed.types";

export async function getAllFeeds(): Promise<Feed[]> {
  return db.select().from(feeds).orderBy(asc(feeds.label));
}

export async function getFeedById(id: number): Promise<Feed | null> {
  const result = await db.select().from(feeds).where(eq(feeds.id, id));
  return result[0] ?? null;
}

export async function updateFeed(
  id: number,
  input: UpdateFeedInput
): Promise<Feed> {
  const existing = await getFeedById(id);
  if (!existing) {
    throw new Error("Feed niet gevonden");
  }

  const duplicate = await db
    .select()
    .from(feeds)
    .where(and(eq(feeds.url, input.url), ne(feeds.id, id)));
  if (duplicate.length > 0) {
    throw new Error("Deze URL bestaat al");
  }

  const now = new Date().toISOString();
  const updated = await db
    .update(feeds)
    .set({ label: input.label, url: input.url, updatedAt: now })
    .where(eq(feeds.id, id))
    .returning();

  return updated[0];
}
