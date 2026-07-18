import { findMatch } from "./matcher.ts";
import type { RouteMatch } from "./types.ts";

interface ApiRouteLike {
	pattern: string;
	module: () => Promise<{ prerender?: unknown }>;
}

/**
 * Resolve an incoming request path to an API route, applying the `.json` alias.
 *
 * When the URL ends in `.json` the bare path is tried first. If the bare-path
 * route opted into `prerender = true`, the alias wins — this prevents a
 * catch-all sibling (e.g. `/api/components/[...path]`) from swallowing the
 * `.json` suffix as part of its rest-segment param and returning a 4xx from
 * the catch-all handler. Non-prerender bare-path matches fall through to the
 * literal `.json` path so legitimate `<segment>.json` routes still resolve.
 */
export function resolveApiMatch<T extends ApiRouteLike>(
	routes: T[],
	path: string,
): RouteMatch<T> | null | Promise<RouteMatch<T> | null> {
	// Only `.json` needs the async alias probe (it may await a module to read
	// `prerender`). Plain paths resolve synchronously so the common request
	// never pays a microtask hop.
	if (path.endsWith(".json")) return resolveJsonMatch(routes, path);
	return findMatch(routes, path);
}

async function resolveJsonMatch<T extends ApiRouteLike>(
	routes: T[],
	path: string,
): Promise<RouteMatch<T> | null> {
	const bare = path.slice(0, -".json".length);
	const aliased = findMatch(routes, bare);
	if (aliased) {
		try {
			const mod = await aliased.route.module();
			if (mod.prerender === true) return aliased;
		} catch {
			/* fall through to literal-path match */
		}
	}
	return findMatch(routes, path);
}
