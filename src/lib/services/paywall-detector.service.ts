/**
 * Paywall detection service.
 *
 * Detects whether an article URL is behind a paywall using:
 * 1. Known paywall domain matching
 * 2. HTTP response status code (403 / 401 / 402)
 * 3. Response content patterns (paywall indicators in HTML)
 */

const PAYWALL_DOMAINS = [
  "nrc.nl",
  "volkskrant.nl",
  "fd.nl",
  "trouw.nl",
  "telegraaf.nl",
  "parool.nl",
  "ad.nl",
  "hln.be",
  "standaard.be",
  "demorgen.be",
  "tijd.be",
];

const PAYWALL_CONTENT_PATTERNS = [
  /paywall/i,
  /subscribe to (read|continue|access)/i,
  /abonnement/i,
  /(aanmelden|meld.*aan|inloggen) om verder te lezen/i,
  /registreer(en)? om verder/i,
  /premium artikel/i,
  /exclusief (artikel )?voor abonnees/i,
  /article-paywall/i,
  /class="paywall/i,
  /id="paywall/i,
];

const FETCH_TIMEOUT_MS = 10_000;

/**
 * Checks if the given hostname matches a known paywall domain.
 */
export function isKnownPaywallDomain(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    const normalised = hostname.replace(/^www\./, "");
    return PAYWALL_DOMAINS.some(
      (domain) => normalised === domain || normalised.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

/**
 * Checks whether the response body contains paywall indicator patterns.
 */
export function hasPaywallContent(html: string): boolean {
  return PAYWALL_CONTENT_PATTERNS.some((pattern) => pattern.test(html));
}

/**
 * Attempts to retrieve the article URL and detects paywall signals.
 *
 * Returns `true` when the article is considered paywalled, `false` otherwise.
 * Never throws — errors are treated as "not paywalled" to avoid blocking the
 * feed-fetch pipeline.
 */
export async function detectPaywall(url: string): Promise<boolean> {
  if (isKnownPaywallDomain(url)) {
    return true;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(url, {
        method: "GET",
        signal: controller.signal,
        headers: { "User-Agent": "OpgeluchtGenerator/1.0" },
        redirect: "follow",
      });
    } finally {
      clearTimeout(timeout);
    }

    if (
      response.status === 401 ||
      response.status === 402 ||
      response.status === 403
    ) {
      return true;
    }

    if (response.ok) {
      const contentType = response.headers.get("content-type") ?? "";
      if (contentType.includes("text/html")) {
        const text = await response.text();
        return hasPaywallContent(text);
      }
    }

    return false;
  } catch {
    return false;
  }
}
