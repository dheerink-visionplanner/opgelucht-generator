import { asc } from "drizzle-orm";
import { db } from "@/db";
import { feeds } from "@/db/schema";
import type { Feed } from "@/lib/types/feed.types";

export async function getAllFeeds(): Promise<Feed[]> {
  return db.select().from(feeds).orderBy(asc(feeds.label));
}
