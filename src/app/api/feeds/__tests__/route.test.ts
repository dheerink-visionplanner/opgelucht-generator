import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../route";

const mockGetAllFeeds = vi.hoisted(() => vi.fn());

vi.mock("@/lib/services/feed-management.service", () => ({
  getAllFeeds: mockGetAllFeeds,
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
