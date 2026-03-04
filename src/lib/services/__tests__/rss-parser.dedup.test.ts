import { describe, it, expect, vi, beforeEach } from "vitest";
import Parser from "rss-parser";
import {
  fetchAndStoreItems,
  getExistingUrls,
} from "../rss-parser.service";

// Mutable mock state for db behavior
let mockExistingUrls: { url: string }[] = [];
let mockInsertError: Error | null = null;

vi.mock("@/db", () => ({
  db: {
    insert: vi.fn(() => ({
      values: vi.fn(() => {
        if (mockInsertError) {
          throw mockInsertError;
        }
      }),
    })),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => mockExistingUrls),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(),
      })),
    })),
  },
}));

// Mock paywall detection to avoid network calls in unit tests
vi.mock("@/lib/services/paywall-detector.service", () => ({
  detectPaywall: vi.fn().mockResolvedValue(false),
}));

const singleItemFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Test Feed</title>
    <item>
      <title>Article A</title>
      <link>https://example.com/article-a</link>
      <pubDate>Sun, 01 Mar 2026 10:00:00 +0000</pubDate>
    </item>
  </channel>
</rss>`;

const twoItemFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Test Feed</title>
    <item>
      <title>Article A</title>
      <link>https://example.com/article-a</link>
      <pubDate>Sun, 01 Mar 2026 10:00:00 +0000</pubDate>
    </item>
    <item>
      <title>Article B</title>
      <link>https://example.com/article-b</link>
      <pubDate>Sun, 01 Mar 2026 11:00:00 +0000</pubDate>
    </item>
  </channel>
</rss>`;

const duplicateItemFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Test Feed</title>
    <item>
      <title>Article A First</title>
      <link>https://example.com/article-a</link>
      <pubDate>Sun, 01 Mar 2026 10:00:00 +0000</pubDate>
    </item>
    <item>
      <title>Article A Second</title>
      <link>https://example.com/article-a</link>
      <pubDate>Sun, 01 Mar 2026 11:00:00 +0000</pubDate>
    </item>
  </channel>
</rss>`;

describe("getExistingUrls", () => {
  beforeEach(() => {
    mockExistingUrls = [];
    mockInsertError = null;
  });

  it("should return empty set for empty input array", async () => {
    const result = await getExistingUrls([]);
    expect(result).toEqual(new Set());
  });

  it("should return set of existing URLs from database", async () => {
    mockExistingUrls = [
      { url: "https://example.com/article-a" },
      { url: "https://example.com/article-b" },
    ];

    const result = await getExistingUrls([
      "https://example.com/article-a",
      "https://example.com/article-b",
      "https://example.com/article-c",
    ]);

    expect(result.has("https://example.com/article-a")).toBe(true);
    expect(result.has("https://example.com/article-b")).toBe(true);
    expect(result.has("https://example.com/article-c")).toBe(false);
  });
});

describe("Deduplication", () => {
  let parseURLSpy: ReturnType<typeof vi.spyOn>;
  const localParser = new Parser();

  beforeEach(() => {
    mockExistingUrls = [];
    mockInsertError = null;
    parseURLSpy = vi.spyOn(Parser.prototype, "parseURL");
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should skip same URL within a single feed (in-feed dedup via seenInCycle)", async () => {
    const parsed = await localParser.parseString(duplicateItemFeed);
    parseURLSpy.mockResolvedValue(parsed);

    const seenInCycle = new Set<string>();
    const result = await fetchAndStoreItems(
      1,
      "Test Feed",
      "https://example.com/feed",
      seenInCycle,
    );

    // First occurrence inserted, second skipped via seenInCycle
    expect(result.itemsParsed).toBe(2);
    expect(result.itemsNew).toBe(1);
    expect(result.itemsSkippedDuplicate).toBe(1);
  });

  it("should skip same URL across two feeds in same cycle", async () => {
    const parsed = await localParser.parseString(singleItemFeed);
    parseURLSpy.mockResolvedValue(parsed);

    const seenInCycle = new Set<string>();

    // First feed — item is new
    const result1 = await fetchAndStoreItems(
      1,
      "Feed 1",
      "https://example.com/feed1",
      seenInCycle,
    );
    expect(result1.itemsNew).toBe(1);
    expect(result1.itemsSkippedDuplicate).toBe(0);

    // Second feed — same URL, should be skipped as cross-feed duplicate
    const result2 = await fetchAndStoreItems(
      2,
      "Feed 2",
      "https://example.com/feed2",
      seenInCycle,
    );
    expect(result2.itemsNew).toBe(0);
    expect(result2.itemsSkippedDuplicate).toBe(1);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("[Dedup] Skipped cross-feed duplicate"),
    );
  });

  it("should skip URL already existing in database", async () => {
    mockExistingUrls = [{ url: "https://example.com/article-a" }];

    const parsed = await localParser.parseString(singleItemFeed);
    parseURLSpy.mockResolvedValue(parsed);

    const seenInCycle = new Set<string>();
    const result = await fetchAndStoreItems(
      1,
      "Test Feed",
      "https://example.com/feed",
      seenInCycle,
    );

    expect(result.itemsParsed).toBe(1);
    expect(result.itemsNew).toBe(0);
    expect(result.itemsSkippedDuplicate).toBe(1);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("already in database"),
    );
  });

  it("should store all items when none are duplicates", async () => {
    const parsed = await localParser.parseString(twoItemFeed);
    parseURLSpy.mockResolvedValue(parsed);

    const seenInCycle = new Set<string>();
    const result = await fetchAndStoreItems(
      1,
      "Test Feed",
      "https://example.com/feed",
      seenInCycle,
    );

    expect(result.itemsParsed).toBe(2);
    expect(result.itemsNew).toBe(2);
    expect(result.itemsSkippedDuplicate).toBe(0);
  });

  it("should store nothing when all items are duplicates", async () => {
    mockExistingUrls = [
      { url: "https://example.com/article-a" },
      { url: "https://example.com/article-b" },
    ];

    const parsed = await localParser.parseString(twoItemFeed);
    parseURLSpy.mockResolvedValue(parsed);

    const seenInCycle = new Set<string>();
    const result = await fetchAndStoreItems(
      1,
      "Test Feed",
      "https://example.com/feed",
      seenInCycle,
    );

    expect(result.itemsParsed).toBe(2);
    expect(result.itemsNew).toBe(0);
    expect(result.itemsSkippedDuplicate).toBe(2);
  });

  it("should handle mix of new and duplicate items", async () => {
    mockExistingUrls = [{ url: "https://example.com/article-a" }];

    const parsed = await localParser.parseString(twoItemFeed);
    parseURLSpy.mockResolvedValue(parsed);

    const seenInCycle = new Set<string>();
    const result = await fetchAndStoreItems(
      1,
      "Test Feed",
      "https://example.com/feed",
      seenInCycle,
    );

    expect(result.itemsParsed).toBe(2);
    expect(result.itemsNew).toBe(1);
    expect(result.itemsSkippedDuplicate).toBe(1);
  });

  it("should handle UNIQUE constraint violation as duplicate fallback", async () => {
    mockInsertError = new Error("UNIQUE constraint failed: news_items.url");

    const parsed = await localParser.parseString(singleItemFeed);
    parseURLSpy.mockResolvedValue(parsed);

    const seenInCycle = new Set<string>();
    const result = await fetchAndStoreItems(
      1,
      "Test Feed",
      "https://example.com/feed",
      seenInCycle,
    );

    expect(result.itemsParsed).toBe(1);
    expect(result.itemsNew).toBe(0);
    expect(result.itemsSkippedDuplicate).toBe(1);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("constraint violation"),
    );
  });

  it("should record non-unique-constraint insert errors", async () => {
    mockInsertError = new Error("Database connection lost");

    const parsed = await localParser.parseString(singleItemFeed);
    parseURLSpy.mockResolvedValue(parsed);

    const seenInCycle = new Set<string>();
    const result = await fetchAndStoreItems(
      1,
      "Test Feed",
      "https://example.com/feed",
      seenInCycle,
    );

    expect(result.itemsParsed).toBe(1);
    expect(result.itemsNew).toBe(0);
    expect(result.itemsSkippedDuplicate).toBe(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain("Database connection lost");
  });
});
