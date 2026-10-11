const AUTH_PAGES = ["/login", "/register"];

/**
 * In-app path to return to after login, taken from an untrusted `next` param.
 * Only same-origin relative paths pass; `//evil.com`, `/\evil.com` and absolute URLs
 * fall back (open-redirect guard). Auth pages fall back too, so login can't loop on itself.
 */
export function safeNextPath(next: string | null | undefined, fallback = "/dashboard"): string {
  if (!next?.startsWith("/")) return fallback;
  try {
    // The URL parser applies the same normalisation as the browser (backslashes, tabs, ...).
    const url = new URL(next, "http://n");
    // A normalised pathname can still start with "//" (e.g. "/.//evil.com").
    if (url.origin !== "http://n" || url.pathname.startsWith("//") || AUTH_PAGES.includes(url.pathname)) {
      return fallback;
    }
    return url.pathname + url.search + url.hash;
  } catch {
    return fallback;
  }
}
