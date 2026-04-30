import { readdirSync, existsSync, readFileSync } from "fs";
import { join } from "path";
import type { PageRoute, ApiRoute, RouteManifest, TrailingSlash } from "./types.ts";

// ─── Route Scanner ───────────────────────────────────────
// Walks src/routes/ and produces a RouteManifest.
//
// Conventions (SvelteKit-compatible):
//   +page.svelte         — page component
//   +page.server.ts      — server loader for the page
//   +layout.svelte       — layout component (wraps all children)
//   +layout.server.ts    — server loader for the layout
//   +server.ts           — API route (GET, POST, etc.)
//   (group)/             — route group: invisible in URL, shares layouts
//   [param]/             — dynamic segment
//   [...rest]/           — catch-all segment

const ROUTES_DIR = "./src/routes";

/**
 * Extract `export const trailingSlash = '...'` from a server module file via
 * regex. Static-string read only — runtime expressions return null. Build-time
 * scan avoids invoking server modules during the client bundle.
 */
function readTrailingSlash(filePath: string): TrailingSlash | null {
	try {
		const src = readFileSync(filePath, "utf-8");
		const m = src.match(
			/export\s+const\s+trailingSlash\s*(?::\s*[^=]+)?=\s*["'](never|always|ignore)["']/,
		);
		return (m?.[1] ?? null) as TrailingSlash | null;
	} catch {
		return null;
	}
}

export function scanRoutes(): RouteManifest {
	const pages: PageRoute[] = [];
	const apis: ApiRoute[] = [];

	function walk(
		dir: string,
		urlSegments: string[],
		layoutChain: string[],
		layoutServerChain: { path: string; depth: number }[],
		inheritedTrailingSlash: TrailingSlash,
	) {
		const fullDir = join(ROUTES_DIR, dir);
		if (!existsSync(fullDir)) return;

		const items = readdirSync(fullDir, { withFileTypes: true });

		// Accumulate layouts for this level
		const currentLayouts = [...layoutChain];
		const currentLayoutServers = [...layoutServerChain];
		let currentTrailingSlash = inheritedTrailingSlash;

		if (items.some((i) => i.isFile() && i.name === "+layout.svelte")) {
			currentLayouts.push(join(dir, "+layout.svelte"));
		}
		if (items.some((i) => i.isFile() && i.name === "+layout.server.ts")) {
			const layoutServerPath = join(dir, "+layout.server.ts");
			currentLayoutServers.push({
				path: layoutServerPath,
				depth: currentLayouts.length - 1,
			});
			const ts = readTrailingSlash(join(ROUTES_DIR, layoutServerPath));
			if (ts) currentTrailingSlash = ts;
		}

		// API route (+server.ts)
		if (items.some((i) => i.isFile() && i.name === "+server.ts")) {
			apis.push({
				pattern: toUrlPath(urlSegments),
				server: join(dir, "+server.ts"),
			});
		}

		// Page route (+page.svelte)
		if (items.some((i) => i.isFile() && i.name === "+page.svelte")) {
			const pageServerFile = items.some((i) => i.isFile() && i.name === "+page.server.ts")
				? join(dir, "+page.server.ts")
				: null;

			const pageTs = pageServerFile
				? readTrailingSlash(join(ROUTES_DIR, pageServerFile))
				: null;
			const effectiveTs: TrailingSlash = pageTs ?? currentTrailingSlash;

			pages.push({
				pattern: toUrlPath(urlSegments),
				page: join(dir, "+page.svelte"),
				layouts: [...currentLayouts],
				pageServer: pageServerFile,
				layoutServers: [...currentLayoutServers],
				trailingSlash: effectiveTs,
			});
		}

		// Recurse into subdirectories
		for (const entry of items) {
			if (!entry.isDirectory() || entry.name.startsWith(".") || entry.name === "node_modules")
				continue;

			const dirName = entry.name;
			// Route groups like (public), (auth) are invisible in URLs
			const isGroup = /^\(.*\)$/.test(dirName);

			walk(
				dir ? join(dir, dirName) : dirName,
				isGroup ? [...urlSegments] : [...urlSegments, dirName],
				currentLayouts,
				currentLayoutServers,
				currentTrailingSlash,
			);
		}
	}

	walk("", [], [], [], "never");

	// Warn when a catch-all exists but no exact route covers its prefix.
	// e.g. "/[...slug]" matches everything EXCEPT "/" (which needs its own +page.svelte).
	const exactPatterns = new Set(
		pages.filter((p) => !p.pattern.includes("[")).map((p) => p.pattern),
	);
	for (const p of pages) {
		const m = p.pattern.match(/^(.*?)\/\[\.\.\.(\w+)\]$/);
		if (m) {
			const exactEquivalent = m[1] || "/";
			if (!exactPatterns.has(exactEquivalent)) {
				console.warn(
					`⚠️  No exact route for "${exactEquivalent}" — the catch-all "${p.pattern}" will NOT match it.\n` +
						`   Add a +page.svelte at the "${exactEquivalent}" level to serve that URL.`,
				);
			}
		}
	}

	const errorPage = existsSync(join(ROUTES_DIR, "+error.svelte")) ? "+error.svelte" : null;

	return { pages, apis, errorPage };
}

function toUrlPath(segments: string[]): string {
	if (segments.length === 0) return "/";
	return "/" + segments.join("/");
}
