// packages/bosia/src/core/dedup.ts
// Request deduplication for concurrent identical GET requests to /__bosia/data/

const inflight = new Map<string, Promise<any>>();

const AUTH_COOKIE_RE = /(?:^|;\s*)authorization=([^;]*)/i;

/** Build dedup key from route URL + request identity. Sort search params for consistency. */
export function dedupKey(url: URL, request: Request): string {
	let path = url.pathname;
	if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
	const sorted = new URLSearchParams([...url.searchParams.entries()].sort());
	const search = sorted.toString();
	const base = search ? `${path}?${search}` : path;

	const authHeader = request.headers.get("authorization") ?? "";
	const cookieHeader = request.headers.get("cookie") ?? "";
	const match = cookieHeader.match(AUTH_COOKIE_RE);
	const authCookie = match?.[1] ?? "";
	const identity = authHeader || authCookie;
	if (!identity) return base;
	return `${base}|${Bun.hash(identity).toString(36)}`;
}

/** Run `fn` with dedup. Concurrent calls with same key share the in-flight promise. */
export function dedup<T>(key: string, fn: () => Promise<T>): Promise<T> {
	const existing = inflight.get(key);
	if (existing) return existing;
	const promise = fn().finally(() => inflight.delete(key));
	inflight.set(key, promise);
	return promise;
}
