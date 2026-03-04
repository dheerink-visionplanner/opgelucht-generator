import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAllCategories, updateCategory } from "../categories.service";

vi.mock("@/db", () => ({
  db: {
    select: vi.fn(),
    update: vi.fn(),
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

describe("updateCategory", () => {
  const mockReturning = vi.fn();
  const mockWhere = vi.fn(() => ({ returning: mockReturning }));
  const mockSet = vi.fn(() => ({ where: mockWhere }));
  const mockUpdate = vi.fn(() => ({ set: mockSet }));

  beforeEach(async () => {
    const { db } = await import("@/db");
    vi.mocked(db.update).mockImplementation(mockUpdate);
    mockUpdate.mockReturnValue({ set: mockSet });
    mockSet.mockReturnValue({ where: mockWhere });
    mockWhere.mockReturnValue({ returning: mockReturning });
  });

  it("should return the updated category", async () => {
    const updated = {
      id: 1,
      name: "Nieuw Overheid",
      sortOrder: 1,
      createdAt: "2026-01-01",
      updatedAt: "2026-03-04",
    };
    mockReturning.mockResolvedValue([updated]);

    const result = await updateCategory(1, { name: "Nieuw Overheid" });

    expect(result).toEqual(updated);
    expect(mockUpdate).toHaveBeenCalled();
    expect(mockSet).toHaveBeenCalled();
    expect(mockWhere).toHaveBeenCalled();
  });

  it("should throw 'Categorie niet gevonden' when no rows are returned", async () => {
    mockReturning.mockResolvedValue([]);

    await expect(updateCategory(99, { name: "Onbekend" })).rejects.toThrow(
      "Categorie niet gevonden",
    );
  });

  it("should throw 'Categorie bestaat al' on unique constraint violation", async () => {
    mockReturning.mockRejectedValue(new Error("UNIQUE constraint failed: categories.name"));

    await expect(updateCategory(1, { name: "Bestaande naam" })).rejects.toThrow(
      "Categorie bestaat al",
    );
  });

  it("should propagate unexpected database errors", async () => {
    mockReturning.mockRejectedValue(new Error("Disk full"));

    await expect(updateCategory(1, { name: "Test" })).rejects.toThrow("Disk full");
  });
});

