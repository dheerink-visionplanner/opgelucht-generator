import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "../route";

const mockGetAllFeeds = vi.hoisted(() => vi.fn());
const mockCreateFeed = vi.hoisted(() => vi.fn());

vi.mock("@/lib/services/feed-management.service", () => ({
  getAllFeeds: mockGetAllFeeds,
  createFeed: mockCreateFeed,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/feeds", () => {
  it("should return all feeds with status 200", async () => {
    const mockFeeds = [
      {
        id: 1,
        label: "Roken",
        url: "https://www.google.com/alerts/feeds/1/roken",
        isActive: true,
        lastFetchedAt: "2026-03-01T10:00:00.000Z",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-03-01T10:00:00.000Z",
      },
    ];
    mockGetAllFeeds.mockResolvedValue(mockFeeds);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ feeds: mockFeeds });
  });

  it("should return an empty feeds array when no feeds exist", async () => {
    mockGetAllFeeds.mockResolvedValue([]);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ feeds: [] });
  });

  it("should return status 500 when the service throws an error", async () => {
    mockGetAllFeeds.mockRejectedValue(new Error("Database error"));

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: "Failed to retrieve feeds" });
  });
});

describe("POST /api/feeds", () => {
  function makeRequest(body: unknown) {
    return new Request("http://localhost/api/feeds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  it("should create a feed and return status 201", async () => {
    const input = {
      label: "Roken",
      url: "https://www.google.com/alerts/feeds/1/roken",
    };
    const createdFeed = {
      id: 1,
      ...input,
      isActive: true,
      lastFetchedAt: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    mockCreateFeed.mockResolvedValue(createdFeed);

    const response = await POST(makeRequest(input));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual({ feed: createdFeed });
  });

  it("should return status 400 when label is missing", async () => {
    const response = await POST(makeRequest({ url: "https://example.com/feed" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBeDefined();
  });

  it("should return status 400 when URL is invalid", async () => {
    const response = await POST(makeRequest({ label: "Test", url: "not-a-url" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBeDefined();
  });

  it("should return status 409 when URL already exists", async () => {
    mockCreateFeed.mockRejectedValue(new Error("DUPLICATE_URL"));

    const response = await POST(
      makeRequest({ label: "Roken", url: "https://www.google.com/alerts/feeds/1/roken" })
    );
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body).toEqual({ error: "Deze URL bestaat al" });
  });

  it("should return status 500 on unexpected service error", async () => {
    mockCreateFeed.mockRejectedValue(new Error("Database connection failed"));

    const response = await POST(
      makeRequest({ label: "Roken", url: "https://www.google.com/alerts/feeds/1/roken" })
    );
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: "Opslaan mislukt" });
  });
});

