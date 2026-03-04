/**
 * Paywall resolver service.
 *
 * Attempts to find a non-paywalled version of an article by trying archive
 * services in order: archive.ph, 1ft.io, 12ft.io, web.archive.org.
 * Stops at the first service that returns accessible content.
 */

/**
 * Archive services to try, in order of preference.
 *
 * - archive.ph: retrieves the most recently cached snapshot for the URL
 * - 1ft.io: proxy that bypasses paywalls by stripping JavaScript-based gates
 * - 12ft.io: similar proxy approach using a query parameter
 * - web.archive.org: Wayback Machine lookup; may not have a recent snapshot
 */
export const ARCHIVE_SERVICES = [
  {
    name: "archive.ph",
    buildUrl: (originalUrl: string) =>
      `https://archive.ph/newest/${encodeURIComponent(originalUrl)}`,
  },
  {
    name: "1ft.io",
    buildUrl: (originalUrl: string) =>
      `https://1ft.io/${encodeURIComponent(originalUrl)}`,
  },
  {
    name: "12ft.io",
    buildUrl: (originalUrl: string) =>
      `https://12ft.io/proxy?q=${encodeURIComponent(originalUrl)}`,
  },
  {
    name: "web.archive.org",
    buildUrl: (originalUrl: string) =>
      `https://web.archive.org/web/${encodeURIComponent(originalUrl)}`,
  },
] as const;

export const RESOLVE_TIMEOUT_MS = 10_000;

/**
 * Checks whether the given archive URL is accessible (returns HTTP 200).
 */
export async function isArchiveAccessible(
  archiveUrl: string,
  timeoutMs: number = RESOLVE_TIMEOUT_MS
): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(archiveUrl, {
      method: "GET",
      signal: controller.signal,
      headers: { "User-Agent": "OpgeluchtGenerator/1.0" },
      redirect: "follow",
    });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Tries each archive service in order and returns the first accessible
 * archive URL, or `null` if none can resolve the paywall.
 */
export async function resolvePaywall(
  originalUrl: string,
  timeoutMs: number = RESOLVE_TIMEOUT_MS
): Promise<string | null> {
  for (const service of ARCHIVE_SERVICES) {
    const archiveUrl = service.buildUrl(originalUrl);
    const accessible = await isArchiveAccessible(archiveUrl, timeoutMs);
    if (accessible) {
      return archiveUrl;
    }
  }

  return null;
}
