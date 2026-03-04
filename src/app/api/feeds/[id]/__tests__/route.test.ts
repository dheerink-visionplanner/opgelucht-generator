import { describe, it, expect, vi, beforeEach } from "vitest";
import { DELETE } from "../route";

const mockDeleteFeed = vi.hoisted(() => vi.fn());

vi.mock("@/lib/services/feed-management.service", () => ({
  deleteFeed: mockDeleteFeed,
}));

function makeParams(id: string): { params: Promise<{ id: string }> } {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("DELETE /api/feeds/[id]", () => {
  it("should return 204 when the feed is deleted successfully", async () => {
    mockDeleteFeed.mockResolvedValue(undefined);

    const response = await DELETE(new Request("http://localhost"), makeParams("1"));

    expect(response.status).toBe(204);
  });

  it("should return 400 when id is not a valid integer", async () => {
    const response = await DELETE(new Request("http://localhost"), makeParams("abc"));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: "Ongeldig ID" });
  });

  it("should return 404 when the feed is not found", async () => {
    mockDeleteFeed.mockRejectedValue(new Error("Feed niet gevonden"));

    const response = await DELETE(new Request("http://localhost"), makeParams("99"));
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({ error: "Feed niet gevonden" });
  });

  it("should return 500 when the service throws an unexpected error", async () => {
    mockDeleteFeed.mockRejectedValue(new Error("Unexpected database error"));

    const response = await DELETE(new Request("http://localhost"), makeParams("1"));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: "Verwijderen mislukt" });
  });
});
