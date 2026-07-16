import { basename, sep } from "path";

// ─── Dev Watcher Classification ──────────────────────────
// Pure helpers for dev.ts (kept separate so they're testable — dev.ts is a
// side-effecting script that starts servers on import).

// Changes that can never affect the built app: docs, tests, editor droppings.
const IGNORED_RE = /\.(md|markdown)$|\.(test|spec)\.[jt]sx?$|(~|\.swp|\.swo|\.tmp)$/i;

export function shouldIgnoreForRebuild(absPath: string): boolean {
	const name = basename(absPath);
	return name === ".DS_Store" || IGNORED_RE.test(name);
}

/**
 * True when a change at `absPath` can alter the route manifest. The scanner
 * only reads `+`-prefixed files and directory structure under src/routes, so
 * everything else (colocated components, lib files) can reuse the cached
 * manifest. A basename without a dot is treated as a directory — group/param
 * folder renames must rescan, and the path may already be gone so we can't
 * stat. False negatives are impossible by construction; false positives just
 * cost one extra scan.
 */
export function affectsRouteManifest(absPath: string, routesDir: string): boolean {
	if (absPath !== routesDir && !absPath.startsWith(routesDir + sep)) return false;
	const name = basename(absPath);
	return name.startsWith("+") || !name.includes(".");
}
