import { join, dirname, delimiter } from "path";
import { existsSync } from "fs";

// This file lives at src/core/paths.ts → package root is ../..
// `import.meta.dir` is undefined on Workers — no package dir and no
// node_modules there, so every lookup below just comes back empty.
const BOSIA_PKG_DIR = import.meta.dir ? join(import.meta.dir, "..", "..") : "";

const NESTED_NM = join(BOSIA_PKG_DIR, "node_modules");

// Walk up from bosia's package dir collecting every ancestor `node_modules/`.
// Covers all install layouts: nested per-workspace, parent-of-node_modules (installed as dep),
// monorepo root (--linker=hoisted), and any intermediate hoist target.
function collectAncestorNodeModules(start: string): string[] {
	const out: string[] = [];
	let dir = start;
	while (true) {
		const nm = join(dir, "node_modules");
		if (existsSync(nm)) out.push(nm);
		const parent = dirname(dir);
		if (parent === dir) break;
		dir = parent;
	}
	return out;
}

const ANCESTOR_NM = BOSIA_PKG_DIR ? collectAncestorNodeModules(dirname(BOSIA_PKG_DIR)) : [];
const ALL_NM = [NESTED_NM, ...ANCESTOR_NM];

/** NODE_PATH value covering nested and every ancestor node_modules */
export const BOSIA_NODE_PATH = ALL_NM.join(delimiter); // ";" on Windows, ":" elsewhere

// On-disk output directory. URL namespace (/dist/client/...) stays stable;
// only the on-disk location moves so dev (.bosia/dev) and a parallel
// `bun run build` (./dist) don't clobber each other.
export const OUT_DIR = process.env.BOSIA_OUT_DIR ?? "./dist";

/** Normalize a filesystem path to forward slashes (for URLs, manifests, imports). */
export function toPosix(p: string): string {
	return p.replace(/\\/g, "/");
}

/** `.bin` file names to try for `name`. Windows shims carry an extension. */
export function binCandidates(name: string, platform: string = process.platform): string[] {
	return platform === "win32" ? [`${name}.exe`, `${name}.cmd`, `${name}.bunx`, name] : [name];
}

/** Find a binary from bosia's dependencies (handles hoisting) */
export function resolveBosiaBin(name: string): string {
	const candidates = binCandidates(name);
	for (const nm of ALL_NM) {
		for (const file of candidates) {
			const bin = join(nm, ".bin", file);
			if (existsSync(bin)) return bin;
		}
	}
	return join(NESTED_NM, ".bin", candidates[0]); // fallback — will produce a clear ENOENT
}
