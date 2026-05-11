import { readFileSync, writeFileSync } from "fs";

// ─── Font @import management for app.css ──────────────────
// Merges Google-Fonts (or any) @import lines into app.css idempotently.
// Each font URL is bracketed with a marker comment so we can detect and skip
// duplicates without parsing real CSS.

const MARK_PREFIX = "/* bosia-font:";

export interface FontEntry {
	[family: string]: string; // family → @import URL
}

/**
 * Inserts `@import url("…");` lines for each font that is not already present.
 * Returns the list of family names that were newly added (empty if no-op).
 */
export function mergeFontImports(cssPath: string, fonts: FontEntry): string[] {
	const existing = readFileSync(cssPath, "utf-8");
	const added: string[] = [];
	const lines: string[] = [];

	for (const [family, url] of Object.entries(fonts)) {
		const marker = `${MARK_PREFIX} ${family} */`;
		if (existing.includes(marker)) continue;
		lines.push(`${marker}\n@import url("${url}");`);
		added.push(family);
	}

	if (lines.length === 0) return [];

	// Prepend after any opening comment block; simplest: prepend to top.
	const next = lines.join("\n") + "\n" + existing;
	writeFileSync(cssPath, next, "utf-8");
	return added;
}

/**
 * Remove font @imports inserted by Bosia by family name. Used when switching themes.
 */
export function removeFontImports(cssPath: string, families: string[]): string[] {
	const existing = readFileSync(cssPath, "utf-8");
	let next = existing;
	const removed: string[] = [];

	for (const family of families) {
		const marker = `${MARK_PREFIX} ${family} */`;
		const re = new RegExp(`${escapeRegExp(marker)}\\n@import url\\("[^"]+"\\);\\n?`, "g");
		if (re.test(next)) {
			next = next.replace(re, "");
			removed.push(family);
		}
	}

	if (removed.length > 0) writeFileSync(cssPath, next, "utf-8");
	return removed;
}

function escapeRegExp(s: string): string {
	return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
