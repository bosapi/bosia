// ─── Client-Side Loader Cache ─────────────────────────────
// Stores the result of each server loader run by stable id (the
// +page.server.ts / +layout.server.ts path emitted by codegen) along
// with the LoaderDeps record captured server-side. On each client
// navigation we use the cache + a "dirty" set populated by the
// `invalidate()` API to decide which loaders need to re-run, sending
// the decision as an `_invalidated=<bits>` query param so the server
// can skip the loaders that haven't conceptually changed.
//
// Cache lives in browser memory only — wiped on hard refresh.

import type { LoaderDeps } from "../hooks.ts";

export type CacheSnapshot = {
	pathname: string;
	params: Record<string, string>;
	searchParams: Record<string, string | null>;
	cookies: Record<string, string | undefined>;
};

export type CacheEntry = {
	nodeId: string;
	data: Record<string, any>;
	deps: LoaderDeps;
	snapshot: CacheSnapshot;
};

export type EvalContext = {
	pathname: string;
	params: Record<string, string>;
	url: URL;
	cookies: Record<string, string | undefined>;
};

function readDocumentCookies(): Record<string, string> {
	const out: Record<string, string> = {};
	if (typeof document === "undefined") return out;
	for (const pair of document.cookie.split(";")) {
		const idx = pair.indexOf("=");
		if (idx === -1) continue;
		const name = pair.slice(0, idx).trim();
		const value = pair.slice(idx + 1).trim();
		if (name) {
			try {
				out[name] = decodeURIComponent(value);
			} catch {
				out[name] = value;
			}
		}
	}
	return out;
}

export function liveContext(
	pathname: string,
	params: Record<string, string>,
	url: URL,
): EvalContext {
	return {
		pathname,
		params,
		url,
		cookies: readDocumentCookies(),
	};
}

/** Capture only the values relevant to a loader's tracked deps. */
export function captureSnapshot(deps: LoaderDeps, ctx: EvalContext): CacheSnapshot {
	const params: Record<string, string> = {};
	for (const k of deps.params) params[k] = ctx.params[k] ?? "";
	const searchParams: Record<string, string | null> = {};
	for (const k of deps.searchParams) searchParams[k] = ctx.url.searchParams.get(k);
	const cookies: Record<string, string | undefined> = {};
	for (const k of deps.cookies) cookies[k] = ctx.cookies[k];
	return { pathname: ctx.pathname, params, searchParams, cookies };
}

export type DirtyState = {
	all: boolean;
	keys: Set<string>;
	urls: Set<string>;
	urlMatchers: Array<(u: URL) => boolean>;
};

export function shouldRerun(entry: CacheEntry, dirty: DirtyState, next: EvalContext): boolean {
	if (dirty.all) return true;
	const { deps, snapshot } = entry;
	// Dirty keys
	for (const k of deps.keys) {
		if (dirty.keys.has(k)) return true;
	}
	// Dirty URLs (string match or predicate match)
	if (deps.urls.length > 0) {
		for (const u of deps.urls) {
			if (dirty.urls.has(u)) return true;
			for (const fn of dirty.urlMatchers) {
				try {
					if (fn(new URL(u))) return true;
				} catch {
					// ignore malformed URL deps
				}
			}
		}
	}
	// Param value changes
	for (const k of deps.params) {
		if (snapshot.params[k] !== (next.params[k] ?? "")) return true;
	}
	// Search param value changes
	for (const k of deps.searchParams) {
		if (snapshot.searchParams[k] !== next.url.searchParams.get(k)) return true;
	}
	// Cookie value changes
	for (const k of deps.cookies) {
		if (k === "*") {
			// Broad cookie read — re-run on any cookie change. Detect by
			// comparing the full incoming jar against the captured slice.
			// In practice an empty captured slice will never equal the live
			// jar once any cookie exists, so we re-run whenever cookies do.
			return true;
		}
		if (snapshot.cookies[k] !== next.cookies[k]) return true;
	}
	// Pathname change for loaders that read the URL
	if (deps.uses_url && snapshot.pathname !== next.pathname) return true;
	return false;
}
