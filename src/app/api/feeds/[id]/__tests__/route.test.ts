import { describe, it, expect, vi, beforeEach } from "vitest";
import { PUT } from "../route";
import { NextRequest } from "next/server";

const mockUpdateFeed = vi.hoisted(() => vi.fn());

vi.mock("@/lib/services/feed-management.service", () => ({
  updateFeed: mockUpdateFeed,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

const mockUpdatedFeed = {
  id: 1,
  label: "Sigaretten",
  url: "https://www.google.com/alerts/feeds/1/sigaretten",
  isActive: true,
  lastFetchedAt: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-03-04T10:00:00.000Z",
};

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/feeds/1", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("PUT /api/feeds/[id]", () => {
  it("should return the updated feed with status 200", async () => {
    mockUpdateFeed.mockResolvedValue(mockUpdatedFeed);

    const request = makeRequest({ label: "Sigaretten", url: "https://www.google.com/alerts/feeds/1/sigaretten" });
    const response = await PUT(request, { params: Promise.resolve({ id: "1" }) });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ feed: mockUpdatedFeed });
  });

  it("should return 400 when id is not a number", async () => {
    const request = makeRequest({ label: "Test", url: "https://example.com" });
    const response = await PUT(request, { params: Promise.resolve({ id: "abc" }) });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: "Ongeldig ID" });
  });

  it("should return 400 when label is missing", async () => {
    const request = makeRequest({ url: "https://example.com/feed" });
    const response = await PUT(request, { params: Promise.resolve({ id: "1" }) });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBeTruthy();
  });

  it("should return 400 when URL is invalid", async () => {
    const request = makeRequest({ label: "Test", url: "not-a-url" });
    const response = await PUT(request, { params: Promise.resolve({ id: "1" }) });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBeTruthy();
  });

  it("should return 404 when feed is not found", async () => {
    mockUpdateFeed.mockRejectedValue(new Error("Feed niet gevonden"));

    const request = makeRequest({ label: "Test", url: "https://example.com/feed" });
    const response = await PUT(request, { params: Promise.resolve({ id: "999" }) });
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({ error: "Feed niet gevonden" });
  });

  it("should return 409 when URL already exists", async () => {
    mockUpdateFeed.mockRejectedValue(new Error("Deze URL bestaat al"));

    const request = makeRequest({ label: "Test", url: "https://example.com/existing" });
    const response = await PUT(request, { params: Promise.resolve({ id: "1" }) });
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body).toEqual({ error: "Deze URL bestaat al" });
  });

  it("should return 500 on unexpected errors", async () => {
    mockUpdateFeed.mockRejectedValue(new Error("Unexpected database failure"));

    const request = makeRequest({ label: "Test", url: "https://example.com/feed" });
    const response = await PUT(request, { params: Promise.resolve({ id: "1" }) });
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: "Opslaan mislukt" });
  });
});
