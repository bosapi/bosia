// ─── ETag matching ───────────────────────────────────────
// Shared by static files (staticManifest.ts) and cached responses (cache.ts).
// No runtime imports: cache.ts also runs on Cloudflare Workers.

/** True when an `If-None-Match` header names `etag` (or `*`). Weak tags match too. */
export function matchesEtag(header: string | null, etag: string): boolean {
	if (!header) return false;
	for (const raw of header.split(",")) {
		const t = raw.trim();
		if (t === "*" || t === etag || (t.startsWith("W/") && t.slice(2) === etag)) return true;
	}
	return false;
}
