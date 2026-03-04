import { describe, it, expect, vi, afterEach } from "vitest";
import {
  isKnownPaywallDomain,
  hasPaywallContent,
  detectPaywall,
} from "../paywall-detector.service";

describe("isKnownPaywallDomain", () => {
  it("should return true for a known paywall domain", () => {
    expect(isKnownPaywallDomain("https://nrc.nl/artikel/123")).toBe(true);
    expect(isKnownPaywallDomain("https://fd.nl/bericht/456")).toBe(true);
    expect(isKnownPaywallDomain("https://volkskrant.nl/nieuws/789")).toBe(true);
  });

  it("should return true for www subdomain of known paywall domain", () => {
    expect(isKnownPaywallDomain("https://www.nrc.nl/artikel/123")).toBe(true);
    expect(isKnownPaywallDomain("https://www.telegraaf.nl/nieuws/456")).toBe(
      true
    );
  });

  it("should return false for a non-paywall domain", () => {
    expect(isKnownPaywallDomain("https://nos.nl/artikel/123")).toBe(false);
    expect(isKnownPaywallDomain("https://example.com/article")).toBe(false);
  });

  it("should return false for an invalid URL", () => {
    expect(isKnownPaywallDomain("not-a-url")).toBe(false);
  });
});

describe("hasPaywallContent", () => {
  it("should detect English paywall patterns", () => {
    expect(hasPaywallContent("subscribe to read the full article")).toBe(true);
    expect(hasPaywallContent("This content is behind a paywall")).toBe(true);
    expect(hasPaywallContent("subscribe to continue reading")).toBe(true);
  });

  it("should detect Dutch paywall patterns", () => {
    expect(hasPaywallContent("Meld u aan om verder te lezen")).toBe(true);
    expect(
      hasPaywallContent("Dit is een exclusief artikel voor abonnees")
    ).toBe(true);
    expect(hasPaywallContent("Premium artikel — abonnement vereist")).toBe(
      true
    );
  });

  it("should detect HTML class-based paywall indicators", () => {
    expect(
      hasPaywallContent('<div class="paywall-overlay">Abonneer nu</div>')
    ).toBe(true);
    expect(
      hasPaywallContent('<section id="paywall">Geen toegang</section>')
    ).toBe(true);
  });

  it("should return false for non-paywalled content", () => {
    expect(
      hasPaywallContent("<html><body><p>Freely accessible article</p></body></html>")
    ).toBe(false);
    expect(hasPaywallContent("Lees het volledige artikel gratis")).toBe(false);
  });
});

describe("detectPaywall", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return true immediately for a known paywall domain without fetching", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const result = await detectPaywall("https://nrc.nl/artikel/123");
    expect(result).toBe(true);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("should return true when server responds with 403", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(null, { status: 403 })
    );
    const result = await detectPaywall("https://unknown-paywalled.example.com/article");
    expect(result).toBe(true);
  });

  it("should return true when server responds with 401", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(null, { status: 401 })
    );
    const result = await detectPaywall("https://unknown-paywalled.example.com/article");
    expect(result).toBe(true);
  });

  it("should return true when server responds with 402", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(null, { status: 402 })
    );
    const result = await detectPaywall("https://unknown-paywalled.example.com/article");
    expect(result).toBe(true);
  });

  it("should return true when HTML content contains paywall patterns", async () => {
    const html =
      "<html><body><div class=\"paywall\">Abonneer om verder te lezen</div></body></html>";
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(html, {
        status: 200,
        headers: { "content-type": "text/html" },
      })
    );
    const result = await detectPaywall("https://example.com/article");
    expect(result).toBe(true);
  });

  it("should return false for freely accessible content", async () => {
    const html = "<html><body><p>Freely accessible article text</p></body></html>";
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(html, {
        status: 200,
        headers: { "content-type": "text/html" },
      })
    );
    const result = await detectPaywall("https://example.com/free-article");
    expect(result).toBe(false);
  });

  it("should return false when fetch throws (network error)", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(
      new Error("Network error")
    );
    const result = await detectPaywall("https://example.com/unreachable");
    expect(result).toBe(false);
  });

  it("should return false for non-HTML content types", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response("{}", {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    );
    const result = await detectPaywall("https://example.com/api/data");
    expect(result).toBe(false);
  });
});
