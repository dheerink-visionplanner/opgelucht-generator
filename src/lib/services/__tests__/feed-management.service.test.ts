import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAllFeeds, deleteFeed } from "../feed-management.service";
import { db } from "@/db";

vi.mock("@/db", () => ({
  db: {
    select: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
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

describe("deleteFeed", () => {
  function setupDeleteMock(returningResult: { id: number }[]) {
    const mockReturning = vi.fn().mockResolvedValue(returningResult);
    const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
    vi.mocked(db.delete).mockReturnValue({ where: mockWhere } as unknown as ReturnType<typeof db.delete>);

    const mockUpdateWhere = vi.fn().mockResolvedValue(undefined);
    const mockSet = vi.fn().mockReturnValue({ where: mockUpdateWhere });
    vi.mocked(db.update).mockReturnValue({ set: mockSet } as unknown as ReturnType<typeof db.update>);

    return { mockReturning, mockWhere, mockUpdateWhere, mockSet };
  }

  it("should nullify feedId on news items and delete the feed", async () => {
    setupDeleteMock([{ id: 1 }]);

    await expect(deleteFeed(1)).resolves.toBeUndefined();

    expect(db.update).toHaveBeenCalled();
    expect(db.delete).toHaveBeenCalled();
  });

  it("should throw when the feed is not found", async () => {
    setupDeleteMock([]);

    await expect(deleteFeed(99)).rejects.toThrow("Feed niet gevonden");
  });

  it("should propagate database errors during delete", async () => {
    const mockReturning = vi.fn().mockRejectedValue(new Error("DB error"));
    const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
    vi.mocked(db.delete).mockReturnValue({ where: mockWhere } as unknown as ReturnType<typeof db.delete>);

    const mockUpdateWhere = vi.fn().mockResolvedValue(undefined);
    const mockSet = vi.fn().mockReturnValue({ where: mockUpdateWhere });
    vi.mocked(db.update).mockReturnValue({ set: mockSet } as unknown as ReturnType<typeof db.update>);

    await expect(deleteFeed(1)).rejects.toThrow("DB error");
  });
});
