import { describe, it, expect, vi, beforeEach } from "vitest";
import Parser from "rss-parser";
import {
  extractSourceName,
  parseFeed,
  fetchAndStoreItems,
} from "../rss-parser.service";

// Mock the database module
vi.mock("@/db", () => ({
  db: {
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        onConflictDoNothing: vi.fn(),
      })),
    })),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => []),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(),
      })),
    })),
  },
}));

const sampleRssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Google Alert - roken</title>
    <link>https://www.google.com/alerts/feeds/123</link>
    <item>
      <title>New vaping law announced</title>
      <link>https://nos.nl/artikel/123</link>
      <pubDate>Sun, 01 Mar 2026 10:00:00 +0000</pubDate>
      <source url="https://nos.nl">NOS</source>
    </item>
    <item>
      <title>Smoking ban extended</title>
      <link>https://nrc.nl/nieuws/456</link>
      <pubDate>Sat, 28 Feb 2026 14:30:00 +0000</pubDate>
      <dc:creator>NRC</dc:creator>
    </item>
    <item>
      <title>Item without pubdate</title>
      <link>https://example.com/no-date</link>
    </item>
    <item>
      <link>https://example.com/no-title</link>
      <pubDate>Mon, 02 Mar 2026 08:00:00 +0000</pubDate>
    </item>
    <item>
      <title>Item without link</title>
      <pubDate>Mon, 02 Mar 2026 09:00:00 +0000</pubDate>
    </item>
  </channel>
</rss>`;

const googleAlertsHtmlContent = `<html><body>
  <a href="https://example.com/article">Article title</a>
  <font color="#6f6f6f">RTL Nieuws</font>
</body></html>`;

describe("extractSourceName", () => {
  it("should use creator field when available", () => {
    const item = { creator: "NRC" } as Parser.Item;
    const feed = { title: "Some Feed" } as Parser.Output<
      Record<string, unknown>
    >;

    expect(extractSourceName(item, feed)).toBe("NRC");
  });

  it("should extract source from Google Alerts HTML content", () => {
    const item = { content: googleAlertsHtmlContent } as Parser.Item;
    const feed = { title: "Google Alert - roken" } as Parser.Output<
      Record<string, unknown>
    >;

    expect(extractSourceName(item, feed)).toBe("RTL Nieuws");
  });

  it("should extract search term from Google Alerts feed title", () => {
    const item = {} as Parser.Item;
    const feed = { title: "Google Alert - roken" } as Parser.Output<
      Record<string, unknown>
    >;

    expect(extractSourceName(item, feed)).toBe("roken");
  });

  it("should handle Google Alerts title with en-dash", () => {
    const item = {} as Parser.Item;
    const feed = { title: "Google Alerts – nicotine" } as Parser.Output<
      Record<string, unknown>
    >;

    expect(extractSourceName(item, feed)).toBe("nicotine");
  });

  it("should fall back to feed title when not a Google Alert", () => {
    const item = {} as Parser.Item;
    const feed = { title: "Regular News Feed" } as Parser.Output<
      Record<string, unknown>
    >;

    expect(extractSourceName(item, feed)).toBe("Regular News Feed");
  });

  it("should return null when no source information is available", () => {
    const item = {} as Parser.Item;
    const feed = {} as Parser.Output<Record<string, unknown>>;

    expect(extractSourceName(item, feed)).toBeNull();
  });
});

describe("parseFeed", () => {
  let parseURLSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    parseURLSpy = vi.spyOn(Parser.prototype, "parseURL");
  });

  it("should parse valid RSS feed and extract fields", async () => {
    const localParser = new Parser();
    const parsed = await localParser.parseString(sampleRssXml);

    parseURLSpy.mockResolvedValue(parsed);

    const result = await parseFeed("https://example.com/feed");

    expect(result.length).toBeGreaterThanOrEqual(3);

    const firstItem = result.find((i) => i.title === "New vaping law announced");
    expect(firstItem).toBeDefined();
    expect(firstItem!.url).toBe("https://nos.nl/artikel/123");
    expect(firstItem!.publicationDate).toBeTruthy();
  });

  it("should use creator as source name when available", async () => {
    const localParser = new Parser();
    const parsed = await localParser.parseString(sampleRssXml);

    parseURLSpy.mockResolvedValue(parsed);

    const result = await parseFeed("https://example.com/feed");
    const nrcItem = result.find((i) => i.title === "Smoking ban extended");

    expect(nrcItem).toBeDefined();
    expect(nrcItem!.sourceName).toBe("NRC");
  });

  it("should handle missing publication date", async () => {
    const localParser = new Parser();
    const parsed = await localParser.parseString(sampleRssXml);

    parseURLSpy.mockResolvedValue(parsed);

    const result = await parseFeed("https://example.com/feed");
    const noDateItem = result.find((i) => i.title === "Item without pubdate");

    expect(noDateItem).toBeDefined();
    expect(noDateItem!.publicationDate).toBeNull();
  });

  it("should use 'Untitled' fallback for missing title", async () => {
    const localParser = new Parser();
    const parsed = await localParser.parseString(sampleRssXml);

    parseURLSpy.mockResolvedValue(parsed);

    const result = await parseFeed("https://example.com/feed");
    const untitledItem = result.find(
      (i) => i.url === "https://example.com/no-title"
    );

    expect(untitledItem).toBeDefined();
    expect(untitledItem!.title).toBe("Untitled");
  });

  it("should filter out items without a link", async () => {
    const localParser = new Parser();
    const parsed = await localParser.parseString(sampleRssXml);

    parseURLSpy.mockResolvedValue(parsed);

    const result = await parseFeed("https://example.com/feed");
    const noLinkItem = result.find(
      (i) => i.title === "Item without link"
    );

    expect(noLinkItem).toBeUndefined();
  });
});

describe("fetchAndStoreItems", () => {
  it("should handle feed fetch error gracefully", async () => {
    const parseURLSpy = vi.spyOn(Parser.prototype, "parseURL");
    parseURLSpy.mockRejectedValue(new Error("Network error"));

    const result = await fetchAndStoreItems(
      1,
      "Test Feed",
      "https://invalid.example.com/feed"
    );

    expect(result.error).toBe("Network error");
    expect(result.items).toHaveLength(0);
    expect(result.feedId).toBe(1);
    expect(result.feedLabel).toBe("Test Feed");
  });

  it("should return parsed items on success", async () => {
    const localParser = new Parser();
    const parsed = await localParser.parseString(sampleRssXml);

    const parseURLSpy = vi.spyOn(Parser.prototype, "parseURL");
    parseURLSpy.mockResolvedValue(parsed);

    const result = await fetchAndStoreItems(
      1,
      "Test Feed",
      "https://example.com/feed"
    );

    expect(result.error).toBeNull();
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.feedId).toBe(1);
    expect(result.feedLabel).toBe("Test Feed");
  });
});
