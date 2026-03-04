import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getAllCategories,
  getCategoryById,
  deleteCategory,
} from "../categories.service";

vi.mock("@/db", () => ({
  db: {
    select: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockOrderBy = vi.fn();
const mockFrom = vi.fn(() => ({ orderBy: mockOrderBy }));
const mockSelect = vi.fn(() => ({ from: mockFrom }));

const mockDeleteExecute = vi.fn();
const mockDeleteWhere = vi.fn(() => mockDeleteExecute());
const mockDeleteFrom = vi.fn(() => ({ where: mockDeleteWhere }));

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

describe("getCategoryById", () => {
  const mockCategory = {
    id: 1,
    name: "Overheid",
    sortOrder: 1,
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  };

  const mockWhereById = vi.fn();
  const mockFromById = vi.fn(() => ({ where: mockWhereById }));
  const mockSelectById = vi.fn(() => ({ from: mockFromById }));

  beforeEach(async () => {
    const { db } = await import("@/db");
    vi.mocked(db.select).mockImplementation(mockSelectById);
    mockSelectById.mockReturnValue({ from: mockFromById });
    mockFromById.mockReturnValue({ where: mockWhereById });
  });

  it("should return a category when found", async () => {
    mockWhereById.mockResolvedValue([mockCategory]);

    const result = await getCategoryById(1);

    expect(result).toEqual(mockCategory);
    expect(mockWhereById).toHaveBeenCalled();
  });

  it("should return null when category is not found", async () => {
    mockWhereById.mockResolvedValue([]);

    const result = await getCategoryById(999);

    expect(result).toBeNull();
  });
});

describe("deleteCategory", () => {
  const mockCategory = {
    id: 1,
    name: "Overheid",
    sortOrder: 1,
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  };

  const mockWhereById = vi.fn();
  const mockFromById = vi.fn(() => ({ where: mockWhereById }));
  const mockSelectById = vi.fn(() => ({ from: mockFromById }));

  beforeEach(async () => {
    const { db } = await import("@/db");
    vi.mocked(db.select).mockImplementation(mockSelectById);
    vi.mocked(db.delete).mockImplementation(mockDeleteFrom as never);
    mockSelectById.mockReturnValue({ from: mockFromById });
    mockFromById.mockReturnValue({ where: mockWhereById });
    mockDeleteFrom.mockReturnValue({ where: mockDeleteWhere });
  });

  it("should delete a category successfully", async () => {
    mockWhereById.mockResolvedValue([mockCategory]);
    mockDeleteWhere.mockResolvedValue(undefined);

    await expect(deleteCategory(1)).resolves.toBeUndefined();
    expect(mockDeleteFrom).toHaveBeenCalled();
    expect(mockDeleteWhere).toHaveBeenCalled();
  });

  it("should throw when category is not found", async () => {
    mockWhereById.mockResolvedValue([]);

    await expect(deleteCategory(999)).rejects.toThrow(
      "Categorie niet gevonden"
    );
  });
});
