import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAllCategories, createCategory } from "../categories.service";
import { db } from "@/db";

vi.mock("@/db", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
  },
}));

const mockOrderBy = vi.fn();
const mockWhere = vi.fn();
const mockFrom = vi.fn();

function setupSelectMock() {
  vi.mocked(db.select).mockReturnValue({
    from: mockFrom,
  } as ReturnType<typeof db.select>);
}

describe("getAllCategories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupSelectMock();
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
    expect(mockFrom).toHaveBeenCalled();
    expect(mockOrderBy).toHaveBeenCalled();
  });

  it("should return an empty array when no categories exist", async () => {
    mockOrderBy.mockResolvedValue([]);

    const result = await getAllCategories();

    expect(result).toEqual([]);
  });
});

describe("createCategory", () => {
  const newCategory = {
    id: 3,
    name: "Wetenschap",
    sortOrder: 0,
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    setupSelectMock();
    // selectFrom supports both .orderBy() and .where() paths
    mockFrom.mockReturnValue({ orderBy: mockOrderBy, where: mockWhere });
  });

  it("should create and return a new category when name is unique", async () => {
    mockWhere.mockResolvedValue([]);

    const mockReturning = vi.fn().mockResolvedValue([newCategory]);
    const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
    vi.mocked(db.insert).mockReturnValue({
      values: mockValues,
    } as ReturnType<typeof db.insert>);

    const result = await createCategory({ name: "Wetenschap" });

    expect(result).toEqual(newCategory);
    expect(mockValues).toHaveBeenCalledWith({ name: "Wetenschap" });
  });

  it("should throw an error when a category with the same name already exists", async () => {
    mockWhere.mockResolvedValue([newCategory]);

    await expect(createCategory({ name: "Wetenschap" })).rejects.toThrow(
      'Categorie met naam "Wetenschap" bestaat al'
    );
  });
});
