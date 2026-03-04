import { describe, it, expect, vi, afterEach } from "vitest";
import {
  ARCHIVE_SERVICES,
  RESOLVE_TIMEOUT_MS,
  isArchiveAccessible,
  resolvePaywall,
} from "../paywall-resolver.service";

describe("ARCHIVE_SERVICES", () => {
  it("should contain archive.ph, 1ft.io, 12ft.io, and web.archive.org in that order", () => {
    const names = ARCHIVE_SERVICES.map((s) => s.name);
    expect(names).toEqual([
      "archive.ph",
      "1ft.io",
      "12ft.io",
      "web.archive.org",
    ]);
  });

  it("should build correct archive.ph URL", () => {
    const service = ARCHIVE_SERVICES.find((s) => s.name === "archive.ph")!;
    const url = service.buildUrl("https://example.com/article");
    expect(url).toBe(
      "https://archive.ph/newest/https%3A%2F%2Fexample.com%2Farticle"
    );
  });

  it("should build correct 1ft.io URL", () => {
    const service = ARCHIVE_SERVICES.find((s) => s.name === "1ft.io")!;
    const url = service.buildUrl("https://example.com/article");
    expect(url).toBe("https://1ft.io/https%3A%2F%2Fexample.com%2Farticle");
  });

  it("should build correct 12ft.io URL", () => {
    const service = ARCHIVE_SERVICES.find((s) => s.name === "12ft.io")!;
    const url = service.buildUrl("https://example.com/article");
    expect(url).toBe(
      "https://12ft.io/proxy?q=https%3A%2F%2Fexample.com%2Farticle"
    );
  });

  it("should build correct web.archive.org URL", () => {
    const service = ARCHIVE_SERVICES.find((s) => s.name === "web.archive.org")!;
    const url = service.buildUrl("https://example.com/article");
    expect(url).toBe(
      "https://web.archive.org/web/https%3A%2F%2Fexample.com%2Farticle"
    );
  });
});

describe("RESOLVE_TIMEOUT_MS", () => {
  it("should default to 10 seconds", () => {
    expect(RESOLVE_TIMEOUT_MS).toBe(10_000);
  });
});

describe("isArchiveAccessible", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return true when archive URL responds with 200", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(null, { status: 200 })
    );
    const result = await isArchiveAccessible("https://archive.ph/newest/https%3A%2F%2Fexample.com%2Farticle");
    expect(result).toBe(true);
  });

  it("should return false when archive URL responds with 404", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(null, { status: 404 })
    );
    const result = await isArchiveAccessible("https://archive.ph/newest/https%3A%2F%2Fexample.com%2Farticle");
    expect(result).toBe(false);
  });

  it("should return false when fetch throws (timeout/network error)", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(
      new Error("AbortError")
    );
    const result = await isArchiveAccessible("https://archive.ph/newest/https%3A%2F%2Fexample.com%2Farticle");
    expect(result).toBe(false);
  });
});

describe("resolvePaywall", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return the first accessible archive URL", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(null, { status: 200 })
    );
    const result = await resolvePaywall("https://nrc.nl/artikel/123");
    const expectedUrl = ARCHIVE_SERVICES[0].buildUrl("https://nrc.nl/artikel/123");
    expect(result).toBe(expectedUrl);
  });

  it("should skip inaccessible services and return the first accessible one", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    // First service fails
    fetchSpy.mockResolvedValueOnce(new Response(null, { status: 404 }));
    // Second service succeeds
    fetchSpy.mockResolvedValueOnce(new Response(null, { status: 200 }));

    const result = await resolvePaywall("https://nrc.nl/artikel/123");
    const expectedUrl = ARCHIVE_SERVICES[1].buildUrl("https://nrc.nl/artikel/123");
    expect(result).toBe(expectedUrl);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("should return null when all archive services are inaccessible", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 404 })
    );
    const result = await resolvePaywall("https://nrc.nl/artikel/123");
    expect(result).toBeNull();
  });

  it("should return null when all archive services throw errors", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new Error("Network error")
    );
    const result = await resolvePaywall("https://nrc.nl/artikel/123");
    expect(result).toBeNull();
  });

  it("should stop after the first accessible service", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockResolvedValueOnce(new Response(null, { status: 200 }));

    await resolvePaywall("https://nrc.nl/artikel/123");
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("should use the provided timeout for each service attempt", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(null, { status: 200 })
    );
    await resolvePaywall("https://nrc.nl/artikel/123", 5_000);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});
