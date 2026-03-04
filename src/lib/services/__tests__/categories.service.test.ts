import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAllCategories } from "../categories.service";

vi.mock("@/db", () => ({
  db: {
    select: vi.fn(),
  },
}));

const mockOrderBy = vi.fn();
const mockFrom = vi.fn(() => ({ orderBy: mockOrderBy }));
const mockSelect = vi.fn(() => ({ from: mockFrom }));

describe("getAllCategories", () => {
  beforeEach(async () => {
    const { db } = await import("@/db");
    vi.mocked(db.select).mockImplementation(mockSelect);
    mockSelect.mockReturnValue({ from: mockFrom });
    mockFrom.mockReturnValue({ orderBy: mockOrderBy });
  });

  it("should return categories sorted by sortOrder then name", async () => {
    const mockCategories = [
      {
        id: 1,
        name: "Overheid",
        sortOrder: 1,
        createdAt: "2026-01-01",
        updatedAt: "2026-01-01",
      },
      {
        id: 2,
        name: "Politiek",
        sortOrder: 2,
        createdAt: "2026-01-01",
        updatedAt: "2026-01-01",
      },
    ];
    mockOrderBy.mockResolvedValue(mockCategories);

    const result = await getAllCategories();

    expect(result).toEqual(mockCategories);
    expect(mockSelect).toHaveBeenCalled();
    expect(mockFrom).toHaveBeenCalled();
    expect(mockOrderBy).toHaveBeenCalled();
  });

  it("should return an empty array when no categories exist", async () => {
    mockOrderBy.mockResolvedValue([]);

    const result = await getAllCategories();

    expect(result).toEqual([]);
  });
});
