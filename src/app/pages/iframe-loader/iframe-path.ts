/**
 * The `path` query parameter of the iframe loader ends up as a trusted resource URL, so it is only accepted when it
 * resolves to an http(s) URL on this app's own origin (the Joomla pages are served under it). The normalised path is
 * returned, never the raw value; anything else gives null and the caller falls back to the default page.
 */
export function safeIframePath(raw: string | null | undefined, baseUri: string = document.baseURI): string | null {
  if (!raw) {
    return null;
  }
  try {
    const base = new URL(baseUri);
    const url = new URL(raw, base);
    if ((url.protocol !== 'http:' && url.protocol !== 'https:') || url.origin !== base.origin) {
      return null;
    }
    return url.pathname + url.search + url.hash;
  } catch {
    return null;
  }
}
