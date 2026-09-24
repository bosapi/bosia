import { readdirSync, readFileSync } from "fs";
import { join } from "path";

import { toPosix } from "./paths.ts";

// Cloudflare Workers has no `Bun` global and no real filesystem, so server code
// that uses either builds fine and then throws on the first request. This scan
// fails the workers build first.
//
// Scans the user's server files only, by path — a Bun call in a plain
// src/lib/*.ts helper that a loader imports is missed. Upgrade path: run the
// check from the workers plugin's onLoad, which sees every bundled file.

export interface WorkersGuardHit {
	file: string;
	line: number;
	col: number;
	message: string;
}

const SERVER_FILE = /(^|\/)(hooks\.server\.(ts|js)|\+server\.(ts|js)|\+[^/]*\.server\.(ts|js))$/;
const LIB_SERVER = /^lib\/server\/.*\.(ts|js)$/;
const FS_MODULES = new Set(["fs", "node:fs", "fs/promises", "node:fs/promises"]);

function isServerFile(rel: string): boolean {
	return (
		(rel.startsWith("routes/") && SERVER_FILE.test(rel)) ||
		rel === "hooks.server.ts" ||
		rel === "hooks.server.js" ||
		LIB_SERVER.test(rel)
	);
}

function badImport(spec: string): string | null {
	if (FS_MODULES.has(spec)) return `imports "${spec}" — Workers has no filesystem`;
	if (spec === "bun" || spec.startsWith("bun:")) return `imports "${spec}" — Bun-only module`;
	return null;
}

export function findWorkersIncompatible(srcDir = "./src"): WorkersGuardHit[] {
	const hits: WorkersGuardHit[] = [];
	let entries: string[];
	try {
		entries = readdirSync(srcDir, { recursive: true }) as string[];
	} catch {
		return hits;
	}
	for (const entry of entries) {
		const rel = toPosix(entry);
		if (!isServerFile(rel)) continue;
		const file = join(srcDir, entry);
		const source = readFileSync(file, "utf-8");
		const lines = source.split("\n");

		let imports: { path: string }[] = [];
		try {
			imports = new Bun.Transpiler({ loader: rel.endsWith(".js") ? "js" : "ts" }).scan(
				source,
			).imports;
		} catch {
			continue; // syntax error — the real build reports it better
		}
		for (const { path } of imports) {
			const message = badImport(path);
			if (!message) continue;
			const quoted = new RegExp(`["']${path.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}["']`);
			const i = Math.max(
				0,
				lines.findIndex((l) => quoted.test(l)),
			);
			hits.push({ file, line: i + 1, col: (lines[i]?.search(quoted) ?? 0) + 1, message });
		}

		// Line-based, so a `Bun.` inside a string or a multi-line block comment
		// also trips it. `typeof Bun` guards on the same line are allowed.
		lines.forEach((l, i) => {
			const t = l.trimStart();
			if (t.startsWith("//") || t.startsWith("*") || l.includes("typeof Bun")) return;
			const m = /\bBun\.(\w+)/.exec(l);
			if (m)
				hits.push({
					file,
					line: i + 1,
					col: m.index + 1,
					message: `uses Bun.${m[1]} — no Bun global on Workers`,
				});
		});
	}
	return hits;
}

/** Formatted failure text, or null when clean. BOSIA_WORKERS_GUARD=0 downgrades to a warning. */
export function workersGuardReport(srcDir = "./src"): string | null {
	const hits = findWorkersIncompatible(srcDir);
	if (hits.length === 0) return null;
	const body = hits.map((h) => `  ${toPosix(h.file)}:${h.line}:${h.col}  ${h.message}`).join("\n");
	const text =
		`Workers guard: server code uses APIs Cloudflare Workers doesn't have\n\n${body}\n\n` +
		"Use fetch/Web APIs or bindings (event.platform.env) instead. " +
		"Set BOSIA_WORKERS_GUARD=0 to downgrade this to a warning.";
	if (process.env.BOSIA_WORKERS_GUARD === "0") {
		console.warn(`⚠️  ${text}`);
		return null;
	}
	return text;
}
