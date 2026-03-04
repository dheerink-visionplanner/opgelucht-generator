import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAllFeeds, getFeedById, updateFeed } from "../feed-management.service";
import { db } from "@/db";

vi.mock("@/db", () => ({
  db: {
    select: vi.fn(),
    update: vi.fn(),
  },
}));

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
  {
    id: 2,
    label: "Vapen",
    url: "https://www.google.com/alerts/feeds/2/vapen",
    isActive: true,
    lastFetchedAt: null,
    createdAt: "2026-01-02T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
  },
];

function setupSelectMock(resolvedValue: unknown) {
  const mockOrderBy = vi.fn().mockResolvedValue(resolvedValue);
  const mockFrom = vi.fn().mockReturnValue({ orderBy: mockOrderBy });
  vi.mocked(db.select).mockReturnValue({ from: mockFrom } as ReturnType<typeof db.select>);
  return { mockOrderBy, mockFrom };
}

function setupSelectWhereMock(resolvedValue: unknown) {
  const mockWhere = vi.fn().mockResolvedValue(resolvedValue);
  const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
  vi.mocked(db.select).mockReturnValue({ from: mockFrom } as ReturnType<typeof db.select>);
  return { mockWhere, mockFrom };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getAllFeeds", () => {
  it("should return all feeds sorted alphabetically by label", async () => {
    setupSelectMock(mockFeeds);

    const result = await getAllFeeds();

    expect(result).toEqual(mockFeeds);
  });

  it("should return an empty array when no feeds are configured", async () => {
    setupSelectMock([]);

    const result = await getAllFeeds();

    expect(result).toEqual([]);
  });

  it("should propagate database errors", async () => {
    const mockOrderBy = vi.fn().mockRejectedValue(new Error("Database error"));
    const mockFrom = vi.fn().mockReturnValue({ orderBy: mockOrderBy });
    vi.mocked(db.select).mockReturnValue({ from: mockFrom } as ReturnType<typeof db.select>);

    await expect(getAllFeeds()).rejects.toThrow("Database error");
  });
});

describe("getFeedById", () => {
  it("should return the feed when found", async () => {
    setupSelectWhereMock([mockFeeds[0]]);

    const result = await getFeedById(1);

    expect(result).toEqual(mockFeeds[0]);
  });

  it("should return null when feed is not found", async () => {
    setupSelectWhereMock([]);

    const result = await getFeedById(999);

    expect(result).toBeNull();
  });
});

describe("updateFeed", () => {
  it("should update feed label and url and return the updated feed", async () => {
    const updatedFeed = { ...mockFeeds[0], label: "Sigaretten", url: "https://www.google.com/alerts/feeds/1/sigaretten" };

    // First call: getFeedById (returns existing)
    const mockWhere1 = vi.fn().mockResolvedValue([mockFeeds[0]]);
    const mockFrom1 = vi.fn().mockReturnValue({ where: mockWhere1 });
    // Second call: duplicate check (returns empty)
    const mockWhere2 = vi.fn().mockResolvedValue([]);
    const mockFrom2 = vi.fn().mockReturnValue({ where: mockWhere2 });

    vi.mocked(db.select)
      .mockReturnValueOnce({ from: mockFrom1 } as ReturnType<typeof db.select>)
      .mockReturnValueOnce({ from: mockFrom2 } as ReturnType<typeof db.select>);

    const mockReturning = vi.fn().mockResolvedValue([updatedFeed]);
    const mockWhere3 = vi.fn().mockReturnValue({ returning: mockReturning });
    const mockSet = vi.fn().mockReturnValue({ where: mockWhere3 });
    vi.mocked(db.update).mockReturnValue({ set: mockSet } as ReturnType<typeof db.update>);

    const result = await updateFeed(1, {
      label: "Sigaretten",
      url: "https://www.google.com/alerts/feeds/1/sigaretten",
    });

    expect(result).toEqual(updatedFeed);
  });

  it("should throw when feed is not found", async () => {
    setupSelectWhereMock([]);

    await expect(
      updateFeed(999, { label: "Test", url: "https://example.com/feed" })
    ).rejects.toThrow("Feed niet gevonden");
  });

  it("should throw when the new URL is already used by another feed", async () => {
    // First call: getFeedById (found)
    const mockWhere1 = vi.fn().mockResolvedValue([mockFeeds[0]]);
    const mockFrom1 = vi.fn().mockReturnValue({ where: mockWhere1 });
    // Second call: duplicate check (found another feed with same URL)
    const mockWhere2 = vi.fn().mockResolvedValue([mockFeeds[1]]);
    const mockFrom2 = vi.fn().mockReturnValue({ where: mockWhere2 });

    vi.mocked(db.select)
      .mockReturnValueOnce({ from: mockFrom1 } as ReturnType<typeof db.select>)
      .mockReturnValueOnce({ from: mockFrom2 } as ReturnType<typeof db.select>);

    await expect(
      updateFeed(1, {
        label: "Roken",
        url: "https://www.google.com/alerts/feeds/2/vapen",
      })
    ).rejects.toThrow("Deze URL bestaat al");
  });
});

