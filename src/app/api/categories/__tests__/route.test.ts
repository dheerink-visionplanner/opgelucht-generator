import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "../route";

const mockGetAllCategories = vi.hoisted(() => vi.fn());
const mockCreateCategory = vi.hoisted(() => vi.fn());

vi.mock("@/lib/services/categories.service", () => ({
  getAllCategories: mockGetAllCategories,
  createCategory: mockCreateCategory,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/categories", () => {
  it("should return all categories with status 200", async () => {
    const mockCategories = [
      {
        id: 1,
        name: "Overheid",
        sortOrder: 1,
        createdAt: "2026-01-01",
        updatedAt: "2026-01-01",
      },
    ];
    mockGetAllCategories.mockResolvedValue(mockCategories);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(mockCategories);
  });

  it("should return status 500 when the service throws an error", async () => {
    mockGetAllCategories.mockRejectedValue(new Error("Database error"));

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: "Failed to fetch categories" });
  });
});

describe("POST /api/categories", () => {
  const newCategory = {
    id: 3,
    name: "Wetenschap",
    sortOrder: 0,
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  };

  function makeRequest(body: unknown): Request {
    return new Request("http://localhost/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  it("should create and return a category with status 201", async () => {
    mockCreateCategory.mockResolvedValue(newCategory);

    const response = await POST(makeRequest({ name: "Wetenschap" }));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual(newCategory);
    expect(mockCreateCategory).toHaveBeenCalledWith({ name: "Wetenschap" });
  });

  it("should return status 400 when name is empty", async () => {
    const response = await POST(makeRequest({ name: "" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBeDefined();
    expect(mockCreateCategory).not.toHaveBeenCalled();
  });

  it("should return status 400 when name is missing", async () => {
    const response = await POST(makeRequest({}));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBeDefined();
    expect(mockCreateCategory).not.toHaveBeenCalled();
  });

  it("should return status 409 when category name already exists", async () => {
    mockCreateCategory.mockRejectedValue(
      new Error('Categorie met naam "Wetenschap" bestaat al')
    );

    const response = await POST(makeRequest({ name: "Wetenschap" }));
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error).toContain("bestaat al");
  });

  it("should return status 500 when service throws unexpected error", async () => {
    mockCreateCategory.mockRejectedValue(new Error("Database connection lost"));

    const response = await POST(makeRequest({ name: "Wetenschap" }));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: "Failed to create category" });
  });
});
