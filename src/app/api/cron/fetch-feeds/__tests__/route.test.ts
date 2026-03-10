import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../route";

const mockFetchAllFeeds = vi.hoisted(() => vi.fn());

vi.mock("@/lib/services/rss-parser.service", () => ({
  fetchAllFeeds: mockFetchAllFeeds,
}));

function makeRequest(authHeader?: string) {
  const headers: Record<string, string> = {};
  if (authHeader !== undefined) {
    headers["authorization"] = authHeader;
  }
  return new Request("http://localhost/api/cron/fetch-feeds", {
    method: "GET",
    headers,
  });
}

const mockResults = [
  {
    feedId: 1,
    feedLabel: "Roken",
    itemsParsed: 5,
    itemsNew: 3,
    itemsSkippedDuplicate: 2,
    errors: [],
    feedError: null,
  },
  {
    feedId: 2,
    feedLabel: "Vapen",
    itemsParsed: 3,
    itemsNew: 1,
    itemsSkippedDuplicate: 2,
    errors: [],
    feedError: "Connection timeout",
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe("GET /api/cron/fetch-feeds", () => {
  describe("when CRON_SECRET is not set", () => {
    it("should allow unauthenticated requests and return fetch results", async () => {
      mockFetchAllFeeds.mockResolvedValue(mockResults);

      const response = await GET(makeRequest());
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.summary).toEqual({
        totalParsed: 8,
        totalNew: 4,
        totalDuplicates: 4,
        feedsWithErrors: 1,
      });
      expect(body.feedResults).toHaveLength(2);
    });
  });

  describe("when CRON_SECRET is set", () => {
    beforeEach(() => {
      vi.stubEnv("CRON_SECRET", "test-secret-123");
    });

    it("should return 401 when Authorization header is missing", async () => {
      const response = await GET(makeRequest());
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body).toEqual({ error: "Unauthorized" });
      expect(mockFetchAllFeeds).not.toHaveBeenCalled();
    });

    it("should return 401 when Authorization header has wrong token", async () => {
      const response = await GET(makeRequest("Bearer wrong-secret"));
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body).toEqual({ error: "Unauthorized" });
      expect(mockFetchAllFeeds).not.toHaveBeenCalled();
    });

    it("should return 401 when Authorization header is not a Bearer token", async () => {
      const response = await GET(makeRequest("test-secret-123"));
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body).toEqual({ error: "Unauthorized" });
      expect(mockFetchAllFeeds).not.toHaveBeenCalled();
    });

    it("should allow requests with the correct Bearer token", async () => {
      mockFetchAllFeeds.mockResolvedValue(mockResults);

      const response = await GET(makeRequest("Bearer test-secret-123"));
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
    });

    it("should return a summary of fetched items", async () => {
      mockFetchAllFeeds.mockResolvedValue(mockResults);

      const response = await GET(makeRequest("Bearer test-secret-123"));
      const body = await response.json();

      expect(body.summary).toEqual({
        totalParsed: 8,
        totalNew: 4,
        totalDuplicates: 4,
        feedsWithErrors: 1,
      });
    });

    it("should return per-feed results", async () => {
      mockFetchAllFeeds.mockResolvedValue(mockResults);

      const response = await GET(makeRequest("Bearer test-secret-123"));
      const body = await response.json();

      expect(body.feedResults).toEqual([
        {
          feedId: 1,
          feedLabel: "Roken",
          itemsParsed: 5,
          itemsNew: 3,
          itemsSkippedDuplicate: 2,
          error: null,
        },
        {
          feedId: 2,
          feedLabel: "Vapen",
          itemsParsed: 3,
          itemsNew: 1,
          itemsSkippedDuplicate: 2,
          error: "Connection timeout",
        },
      ]);
    });

    it("should return status 500 when fetchAllFeeds throws", async () => {
      mockFetchAllFeeds.mockRejectedValue(new Error("Database error"));

      const response = await GET(makeRequest("Bearer test-secret-123"));
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toEqual({ success: false, error: "Failed to fetch feeds" });
    });

    it("should return success true with empty results when no feeds exist", async () => {
      mockFetchAllFeeds.mockResolvedValue([]);

      const response = await GET(makeRequest("Bearer test-secret-123"));
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.summary).toEqual({
        totalParsed: 0,
        totalNew: 0,
        totalDuplicates: 0,
        feedsWithErrors: 0,
      });
      expect(body.feedResults).toEqual([]);
    });
  });
});
