import { describe, it, expect, beforeAll } from "vitest";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { feeds, newsItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import Parser from "rss-parser";
import * as schema from "@/db/schema";

const sampleRssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Google Alert - roken</title>
    <link>https://www.google.com/alerts/feeds/123</link>
    <item>
      <title>New vaping law announced</title>
      <link>https://nos.nl/artikel/123</link>
      <pubDate>Sun, 01 Mar 2026 10:00:00 +0000</pubDate>
      <dc:creator>NOS</dc:creator>
    </item>
    <item>
      <title>Smoking ban extended</title>
      <link>https://nrc.nl/nieuws/456</link>
      <pubDate>Sat, 28 Feb 2026 14:30:00 +0000</pubDate>
      <dc:creator>NRC</dc:creator>
    </item>
  </channel>
</rss>`;

describe("RSS Parser Integration", () => {
  let testDb: ReturnType<typeof drizzle>;

  beforeAll(async () => {
    const client = createClient({ url: ":memory:" });
    testDb = drizzle(client, { schema });

    // Create tables manually for in-memory database
    await client.execute(`
      CREATE TABLE feeds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        label TEXT NOT NULL,
        url TEXT NOT NULL UNIQUE,
        is_active INTEGER NOT NULL DEFAULT 1,
        last_fetched_at TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

    await client.execute(`
      CREATE TABLE news_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        feed_id INTEGER NOT NULL REFERENCES feeds(id),
        title TEXT NOT NULL,
        url TEXT NOT NULL UNIQUE,
        publication_date TEXT,
        source_name TEXT,
        is_paywalled INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'new',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

    // Seed test data
    await testDb.insert(feeds).values({
      label: "roken",
      url: "https://www.google.com/alerts/feeds/roken",
      isActive: true,
    });

    await testDb.insert(feeds).values({
      label: "vapen",
      url: "https://www.google.com/alerts/feeds/vapen",
      isActive: false,
    });
  });

  it("should insert seed feeds correctly", async () => {
    const allFeeds = await testDb.select().from(feeds);
    expect(allFeeds).toHaveLength(2);
    expect(allFeeds[0].label).toBe("roken");
    expect(allFeeds[1].label).toBe("vapen");
  });

  it("should only select active feeds", async () => {
    const activeFeeds = await testDb
      .select()
      .from(feeds)
      .where(eq(feeds.isActive, true));

    expect(activeFeeds).toHaveLength(1);
    expect(activeFeeds[0].label).toBe("roken");
  });

  it("should insert parsed items and skip duplicates", async () => {
    const localParser = new Parser();
    const parsed = await localParser.parseString(sampleRssXml);

    // Insert items from parsed feed
    for (const item of parsed.items) {
      if (!item.link) continue;

      await testDb
        .insert(newsItems)
        .values({
          feedId: 1,
          title: item.title?.trim() || "Untitled",
          url: item.link,
          publicationDate: item.isoDate ?? null,
          sourceName: item.creator ?? null,
        })
        .onConflictDoNothing();
    }

    const items = await testDb.select().from(newsItems);
    expect(items).toHaveLength(2);
    expect(items[0].title).toBe("New vaping law announced");
    expect(items[1].title).toBe("Smoking ban extended");

    // Try inserting duplicates — should be silently skipped
    for (const item of parsed.items) {
      if (!item.link) continue;

      await testDb
        .insert(newsItems)
        .values({
          feedId: 1,
          title: item.title?.trim() || "Untitled",
          url: item.link,
          publicationDate: item.isoDate ?? null,
          sourceName: item.creator ?? null,
        })
        .onConflictDoNothing();
    }

    const itemsAfterDupe = await testDb.select().from(newsItems);
    expect(itemsAfterDupe).toHaveLength(2);
  });

  it("should store news items with correct fields", async () => {
    const items = await testDb.select().from(newsItems);
    const firstItem = items[0];

    expect(firstItem.feedId).toBe(1);
    expect(firstItem.title).toBe("New vaping law announced");
    expect(firstItem.url).toBe("https://nos.nl/artikel/123");
    expect(firstItem.publicationDate).toBeTruthy();
    expect(firstItem.sourceName).toBe("NOS");
    expect(firstItem.status).toBe("new");
  });

  it("should update lastFetchedAt on feed", async () => {
    const now = new Date().toISOString();
    await testDb
      .update(feeds)
      .set({ lastFetchedAt: now })
      .where(eq(feeds.id, 1));

    const updatedFeed = await testDb
      .select()
      .from(feeds)
      .where(eq(feeds.id, 1));

    expect(updatedFeed[0].lastFetchedAt).toBe(now);
  });
});
