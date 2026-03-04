import Parser from "rss-parser";
import { db } from "@/db";
import { feeds, newsItems } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import type { ParsedNewsItem, FeedFetchResult } from "@/lib/types/rss.types";
import { detectPaywall } from "@/lib/services/paywall-detector.service";

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
 * Fetches a single RSS feed URL and maps each item to a ParsedNewsItem,
 * including paywall detection for each article URL.
 */
export async function parseFeed(feedUrl: string): Promise<ParsedNewsItem[]> {
  const feed = await parser.parseURL(feedUrl);

  const items = feed.items.filter((item) => item.link);

  return Promise.all(
    items.map(async (item) => ({
      title: item.title?.trim() || "Untitled",
      url: item.link!,
      publicationDate: item.isoDate ?? null,
      sourceName: extractSourceName(item, feed),
      isPaywalled: await detectPaywall(item.link!),
    }))
  );
}

/**
 * Given a list of URLs, returns the set of URLs that already exist in the database.
 */
export async function getExistingUrls(urls: string[]): Promise<Set<string>> {
  if (urls.length === 0) return new Set();

  const existing = await db
    .select({ url: newsItems.url })
    .from(newsItems)
    .where(inArray(newsItems.url, urls));

  return new Set(existing.map((row) => row.url));
}

/**
 * Orchestrates parsing + storage for a single feed.
 * Pre-checks existing URLs, deduplicates across feeds within the same cycle,
 * and logs skipped duplicates.
 */
export async function fetchAndStoreItems(
  feedId: number,
  feedLabel: string,
  feedUrl: string,
  seenInCycle: Set<string>,
): Promise<FeedFetchResult> {
  const result: FeedFetchResult = {
    feedId,
    feedLabel,
    itemsParsed: 0,
    itemsNew: 0,
    itemsSkippedDuplicate: 0,
    errors: [],
    feedError: null,
  };

  try {
    const parsedItems = await parseFeed(feedUrl);
    result.itemsParsed = parsedItems.length;

    const parsedUrls = parsedItems.map((item) => item.url);
    const existingUrls = await getExistingUrls(parsedUrls);

    for (const item of parsedItems) {
      if (existingUrls.has(item.url)) {
        result.itemsSkippedDuplicate++;
        console.log(
          `[Dedup] Skipped duplicate in feed "${feedLabel}": "${item.title}" (${item.url}) — already in database`,
        );
        continue;
      }

      if (seenInCycle.has(item.url)) {
        result.itemsSkippedDuplicate++;
        console.log(
          `[Dedup] Skipped cross-feed duplicate in feed "${feedLabel}": "${item.title}" (${item.url}) — already fetched from another feed`,
        );
        continue;
      }

      try {
        await db.insert(newsItems).values({
          feedId,
          title: item.title,
          url: item.url,
          publicationDate: item.publicationDate,
          sourceName: item.sourceName,
          isPaywalled: item.isPaywalled,
        });
        result.itemsNew++;
        seenInCycle.add(item.url);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        if (errorMsg.includes("UNIQUE constraint")) {
          result.itemsSkippedDuplicate++;
          console.log(
            `[Dedup] Skipped duplicate in feed "${feedLabel}": "${item.title}" (${item.url}) — constraint violation`,
          );
        } else {
          result.errors.push(`Failed to store "${item.title}": ${errorMsg}`);
          console.error(
            `[Feed: ${feedLabel}] Error storing item: ${errorMsg}`,
          );
        }
      }
    }
  } catch (err) {
    result.feedError = err instanceof Error ? err.message : String(err);
    console.error(`[Feed: ${feedLabel}] Fetch error: ${result.feedError}`);
  }

  return result;
}

/**
 * Fetches all active feeds sequentially with cross-feed deduplication.
 * Updates lastFetchedAt for successfully fetched feeds.
 */
export async function fetchAllFeeds(): Promise<FeedFetchResult[]> {
  const activeFeeds = await db
    .select()
    .from(feeds)
    .where(eq(feeds.isActive, true));

  const seenInCycle = new Set<string>();
  const results: FeedFetchResult[] = [];

  for (const feed of activeFeeds) {
    const result = await fetchAndStoreItems(
      feed.id,
      feed.label,
      feed.url,
      seenInCycle,
    );
    results.push(result);
  }

  for (const result of results) {
    if (!result.feedError) {
      await db
        .update(feeds)
        .set({ lastFetchedAt: new Date().toISOString() })
        .where(eq(feeds.id, result.feedId));
    }
  }

  return results;
}
