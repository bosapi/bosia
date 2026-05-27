import { join, dirname } from "path";
import { existsSync } from "fs";

// This file lives at src/core/paths.ts → package root is ../..
const BOSIA_PKG_DIR = join(import.meta.dir, "..", "..");

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

const ANCESTOR_NM = collectAncestorNodeModules(dirname(BOSIA_PKG_DIR));
const ALL_NM = [NESTED_NM, ...ANCESTOR_NM];

/** NODE_PATH value covering nested and every ancestor node_modules */
export const BOSIA_NODE_PATH = ALL_NM.join(":");

// On-disk output directory. URL namespace (/dist/client/...) stays stable;
// only the on-disk location moves so dev (.bosia/dev) and a parallel
// `bun run build` (./dist) don't clobber each other.
export const OUT_DIR = process.env.BOSIA_OUT_DIR ?? "./dist";

/** Find a binary from bosia's dependencies (handles hoisting) */
export function resolveBosiaBin(name: string): string {
	for (const nm of ALL_NM) {
		const bin = join(nm, ".bin", name);
		if (existsSync(bin)) return bin;
	}
	return join(NESTED_NM, ".bin", name); // fallback — will produce a clear ENOENT
}
