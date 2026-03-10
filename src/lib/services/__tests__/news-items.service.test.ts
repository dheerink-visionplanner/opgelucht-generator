import { describe, it, expect, vi, beforeEach } from "vitest";
import { getUnprocessedNewsItems } from "../news-items.service";
import { db } from "@/db";

vi.mock("@/db", () => ({
  db: {
    select: vi.fn(),
  },
}));

const mockNewsItems = [
  {
    id: 1,
    feedId: 1,
    title: "Artikel over roken",
    url: "https://example.com/artikel-1",
    publicationDate: "2026-03-10T10:00:00.000Z",
    sourceName: "NOS",
    isPaywalled: false,
    status: "new",
    createdAt: "2026-03-10T10:05:00.000Z",
  },
  {
    id: 2,
    feedId: 1,
    title: "Artikel over vapen",
    url: "https://example.com/artikel-2",
    publicationDate: "2026-03-09T08:00:00.000Z",
    sourceName: "RTL Nieuws",
    isPaywalled: true,
    status: "new",
    createdAt: "2026-03-09T08:05:00.000Z",
  },
];

function setupSelectWithWhereOrderByMock(resolvedValue: unknown) {
  const mockOrderBy = vi.fn().mockResolvedValue(resolvedValue);
  const mockWhere = vi.fn().mockReturnValue({ orderBy: mockOrderBy });
  const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
  vi.mocked(db.select).mockReturnValue({ from: mockFrom } as ReturnType<typeof db.select>);
  return { mockOrderBy, mockWhere, mockFrom };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getUnprocessedNewsItems", () => {
  it('should return only items with status "new"', async () => {
    setupSelectWithWhereOrderByMock(mockNewsItems);

    const result = await getUnprocessedNewsItems();

    expect(result).toEqual(mockNewsItems);
    expect(db.select).toHaveBeenCalled();
  });

  it("should sort items by publication date descending", async () => {
    const sorted = [mockNewsItems[0], mockNewsItems[1]];
    setupSelectWithWhereOrderByMock(sorted);

    const result = await getUnprocessedNewsItems();

    expect(result[0].publicationDate).toBe("2026-03-10T10:00:00.000Z");
    expect(result[1].publicationDate).toBe("2026-03-09T08:00:00.000Z");
  });

  it("should return empty array when no unprocessed items exist", async () => {
    setupSelectWithWhereOrderByMock([]);

    const result = await getUnprocessedNewsItems();

    expect(result).toEqual([]);
  });

  it("should propagate database errors", async () => {
    const mockOrderBy = vi.fn().mockRejectedValue(new Error("Database error"));
    const mockWhere = vi.fn().mockReturnValue({ orderBy: mockOrderBy });
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
    vi.mocked(db.select).mockReturnValue({ from: mockFrom } as ReturnType<typeof db.select>);

    await expect(getUnprocessedNewsItems()).rejects.toThrow("Database error");
  });
});
