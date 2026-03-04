import Parser from "rss-parser";
import { db } from "@/db";
import { feeds, newsItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { ParsedNewsItem, FeedFetchResult } from "@/lib/types/rss.types";

const parser = new Parser({
  timeout: 10000,
  headers: { "User-Agent": "OpgeluchtGenerator/1.0" },
});

/**
 * Extracts the source name from an RSS item using multiple fallback strategies:
 * 1. Creator / dc:creator field
 * 2. Google Alerts HTML content (font color="#6f6f6f" pattern)
 * 3. Feed title (stripping "Google Alert - " prefix)
 */
export function extractSourceName(
  item: Parser.Item,
  feed: Parser.Output<Record<string, unknown>>
): string | null {
  if (item.creator) {
    return item.creator;
  }

  if (item.content) {
    const match = item.content.match(
      /<font[^>]*color="#6f6f6f"[^>]*>([^<]+)<\/font>/
    );
    if (match) {
      return match[1].trim();
    }
  }

  if (feed.title) {
    const alertMatch = feed.title.match(/Google Alert[s]?\s*[-–]\s*(.+)/i);
    if (alertMatch) {
      return alertMatch[1].trim();
    }
    return feed.title;
  }

  return null;
}

/**
 * Fetches a single RSS feed URL and maps each item to a ParsedNewsItem.
 */
export async function parseFeed(feedUrl: string): Promise<ParsedNewsItem[]> {
  const feed = await parser.parseURL(feedUrl);

  return feed.items
    .filter((item) => item.link)
    .map((item) => ({
      title: item.title?.trim() || "Untitled",
      url: item.link!,
      publicationDate: item.isoDate ?? null,
      sourceName: extractSourceName(item, feed),
    }));
}

/**
 * Orchestrates parsing + storage for a single feed.
 * Inserts items with onConflictDoNothing to skip duplicates.
 */
export async function fetchAndStoreItems(
  feedId: number,
  feedLabel: string,
  feedUrl: string
): Promise<FeedFetchResult> {
  try {
    const parsedItems = await parseFeed(feedUrl);

    for (const item of parsedItems) {
      try {
        await db
          .insert(newsItems)
          .values({
            feedId,
            title: item.title,
            url: item.url,
            publicationDate: item.publicationDate,
            sourceName: item.sourceName,
          })
          .onConflictDoNothing();
      } catch (err) {
        console.warn(`Skipped item "${item.title}": ${err}`);
      }
    }

    return {
      feedId,
      feedLabel,
      items: parsedItems,
      error: null,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(
      `Error fetching feed "${feedLabel}" (${feedUrl}): ${errorMessage}`
    );
    return {
      feedId,
      feedLabel,
      items: [],
      error: errorMessage,
    };
  }
}

/**
 * Fetches all active feeds independently (one failure doesn't block others).
 * Updates lastFetchedAt for successfully fetched feeds.
 */
export async function fetchAllFeeds(): Promise<FeedFetchResult[]> {
  const activeFeeds = await db
    .select()
    .from(feeds)
    .where(eq(feeds.isActive, true));

  const results = await Promise.allSettled(
    activeFeeds.map((feed) =>
      fetchAndStoreItems(feed.id, feed.label, feed.url)
    )
  );

  for (const result of results) {
    if (result.status === "fulfilled" && !result.value.error) {
      await db
        .update(feeds)
        .set({ lastFetchedAt: new Date().toISOString() })
        .where(eq(feeds.id, result.value.feedId));
    }
  }

  return results.map((r) =>
    r.status === "fulfilled"
      ? r.value
      : {
          feedId: -1,
          feedLabel: "unknown",
          items: [],
          error: String(r.reason),
        }
  );
}
