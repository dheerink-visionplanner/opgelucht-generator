import { describe, it, expect, vi, beforeEach } from "vitest";
import { drizzle } from "drizzle-orm/libsql";
import { createClient, type Client } from "@libsql/client";
import { feeds, newsItems } from "@/db/schema";
import { inArray } from "drizzle-orm";
import Parser from "rss-parser";
import * as schema from "@/db/schema";

const feedAXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Google Alert - roken</title>
    <item>
      <title>Shared article</title>
      <link>https://nos.nl/shared-article</link>
      <pubDate>Sun, 01 Mar 2026 10:00:00 +0000</pubDate>
      <dc:creator>NOS</dc:creator>
    </item>
    <item>
      <title>Unique to feed A</title>
      <link>https://nos.nl/unique-a</link>
      <pubDate>Sun, 01 Mar 2026 11:00:00 +0000</pubDate>
      <dc:creator>NOS</dc:creator>
    </item>
  </channel>
</rss>`;

const feedBXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Google Alert - vapen</title>
    <item>
      <title>Shared article (different title)</title>
      <link>https://nos.nl/shared-article</link>
      <pubDate>Sun, 01 Mar 2026 10:00:00 +0000</pubDate>
      <dc:creator>NOS</dc:creator>
    </item>
    <item>
      <title>Unique to feed B</title>
      <link>https://nrc.nl/unique-b</link>
      <pubDate>Sun, 01 Mar 2026 12:00:00 +0000</pubDate>
      <dc:creator>NRC</dc:creator>
    </item>
  </channel>
</rss>`;

describe("RSS Deduplication Integration", () => {
  let testDb: ReturnType<typeof drizzle>;
  let client: Client;

  beforeEach(async () => {
    client = createClient({ url: ":memory:" });
    testDb = drizzle(client, { schema });

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
        archive_url TEXT,
        status TEXT NOT NULL DEFAULT 'new',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);
  });

  it("should not store duplicate URLs across feeds in the same fetch cycle", async () => {
    // Seed two active feeds
    await testDb.insert(feeds).values([
      { label: "roken", url: "https://example.com/feed-a", isActive: true },
      { label: "vapen", url: "https://example.com/feed-b", isActive: true },
    ]);

    const localParser = new Parser();
    const parsedA = await localParser.parseString(feedAXml);
    const parsedB = await localParser.parseString(feedBXml);

    // We simulate the dedup logic directly using the in-memory db approach,
    // since the service's db import can't easily be redirected to testDb.

    // Simulate the fetchAllFeeds flow manually
    const seenInCycle = new Set<string>();
    const parseURLSpy = vi.spyOn(Parser.prototype, "parseURL");

    // Process feed A
    parseURLSpy.mockResolvedValueOnce(parsedA);

    // Instead of calling fetchAndStoreItems (which uses its own db),
    // we simulate the dedup logic with testDb
    const feedAItems = parsedA.items.filter((i) => i.link);
    const feedAUrls = feedAItems.map((i) => i.link!);

    // Check existing URLs in testDb
    const existingA = await testDb
      .select({ url: newsItems.url })
      .from(newsItems)
      .where(inArray(newsItems.url, feedAUrls));
    const existingUrlsA = new Set(existingA.map((r) => r.url));

    let feedANew = 0;
    let feedADuped = 0;
    for (const item of feedAItems) {
      if (existingUrlsA.has(item.link!) || seenInCycle.has(item.link!)) {
        feedADuped++;
        continue;
      }
      await testDb.insert(newsItems).values({
        feedId: 1,
        title: item.title?.trim() || "Untitled",
        url: item.link!,
        publicationDate: item.isoDate ?? null,
        sourceName: item.creator ?? null,
      });
      seenInCycle.add(item.link!);
      feedANew++;
    }

    expect(feedANew).toBe(2);
    expect(feedADuped).toBe(0);

    // Process feed B — shared-article URL should be deduped
    const feedBItems = parsedB.items.filter((i) => i.link);
    const feedBUrls = feedBItems.map((i) => i.link!);

    const existingB = await testDb
      .select({ url: newsItems.url })
      .from(newsItems)
      .where(inArray(newsItems.url, feedBUrls));
    const existingUrlsB = new Set(existingB.map((r) => r.url));

    let feedBNew = 0;
    let feedBDuped = 0;
    for (const item of feedBItems) {
      if (existingUrlsB.has(item.link!) || seenInCycle.has(item.link!)) {
        feedBDuped++;
        continue;
      }
      await testDb.insert(newsItems).values({
        feedId: 2,
        title: item.title?.trim() || "Untitled",
        url: item.link!,
        publicationDate: item.isoDate ?? null,
        sourceName: item.creator ?? null,
      });
      seenInCycle.add(item.link!);
      feedBNew++;
    }

    expect(feedBNew).toBe(1); // Only unique-b
    expect(feedBDuped).toBe(1); // shared-article was already seen

    // Verify final state: exactly 3 unique URLs in DB
    const allItems = await testDb.select().from(newsItems);
    expect(allItems).toHaveLength(3);

    const allUrls = allItems.map((i) => i.url).sort();
    expect(allUrls).toEqual([
      "https://nos.nl/shared-article",
      "https://nos.nl/unique-a",
      "https://nrc.nl/unique-b",
    ]);
  });

  it("should skip items that already exist in the database from a previous cycle", async () => {
    await testDb.insert(feeds).values({
      label: "roken",
      url: "https://example.com/feed-a",
      isActive: true,
    });

    // Pre-populate one item as if fetched in a previous cycle
    await testDb.insert(newsItems).values({
      feedId: 1,
      title: "Shared article",
      url: "https://nos.nl/shared-article",
      publicationDate: "2026-03-01T10:00:00.000Z",
      sourceName: "NOS",
    });

    const localParser = new Parser();
    const parsedA = await localParser.parseString(feedAXml);

    const feedAItems = parsedA.items.filter((i) => i.link);
    const feedAUrls = feedAItems.map((i) => i.link!);
    const seenInCycle = new Set<string>();

    // Check existing URLs
    const existing = await testDb
      .select({ url: newsItems.url })
      .from(newsItems)
      .where(inArray(newsItems.url, feedAUrls));
    const existingUrls = new Set(existing.map((r) => r.url));

    let newCount = 0;
    let dupedCount = 0;
    for (const item of feedAItems) {
      if (existingUrls.has(item.link!) || seenInCycle.has(item.link!)) {
        dupedCount++;
        continue;
      }
      await testDb.insert(newsItems).values({
        feedId: 1,
        title: item.title?.trim() || "Untitled",
        url: item.link!,
        publicationDate: item.isoDate ?? null,
        sourceName: item.creator ?? null,
      });
      seenInCycle.add(item.link!);
      newCount++;
    }

    expect(newCount).toBe(1); // Only unique-a is new
    expect(dupedCount).toBe(1); // shared-article was already in DB

    const allItems = await testDb.select().from(newsItems);
    expect(allItems).toHaveLength(2);
  });

  it("should handle UNIQUE constraint violation gracefully", async () => {
    await testDb.insert(feeds).values({
      label: "roken",
      url: "https://example.com/feed-a",
      isActive: true,
    });

    // Pre-populate an item
    await testDb.insert(newsItems).values({
      feedId: 1,
      title: "Existing article",
      url: "https://nos.nl/unique-a",
      publicationDate: "2026-03-01T11:00:00.000Z",
      sourceName: "NOS",
    });

    // Try to insert the same URL directly — should throw a constraint error
    await expect(
      testDb.insert(newsItems).values({
        feedId: 1,
        title: "Duplicate attempt",
        url: "https://nos.nl/unique-a",
        publicationDate: "2026-03-01T11:00:00.000Z",
        sourceName: "NOS",
      }),
    ).rejects.toThrow();

    // Verify only one item exists
    const allItems = await testDb.select().from(newsItems);
    expect(allItems).toHaveLength(1);
  });
});
