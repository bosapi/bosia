import { readdirSync, readFileSync } from "fs";
import { join } from "path";

// Registry blocks (navbars, storefront header/footer) ship the brand name as the
// literal `__BRAND__` sentinel so it's unmistakably a placeholder. This guard fails
// `bosia sync` (and therefore `bun run check`) if any survive un-replaced in an app —
// otherwise a fresh scaffold ships someone else's brand in its nav/header/footer.
export const BRAND_SENTINEL = "__BRAND__";

const SRC_DIR = "./src";
const TEXT_EXT = /\.(svelte|ts|js|html|md|json)$/;

export function findBrandPlaceholders(srcDir = SRC_DIR): { file: string; line: number }[] {
	const hits: { file: string; line: number }[] = [];
	let entries: string[];
	try {
		entries = readdirSync(srcDir, { recursive: true }) as string[];
	} catch {
		return hits; // no src/ (e.g. non-app cwd) → nothing to guard
	}
	for (const rel of entries) {
		if (!TEXT_EXT.test(rel)) continue;
		const path = join(srcDir, rel);
		let contents: string;
		try {
			contents = readFileSync(path, "utf-8");
		} catch {
			continue; // directory or unreadable
		}
		if (!contents.includes(BRAND_SENTINEL)) continue;
		contents.split("\n").forEach((l, i) => {
			if (l.includes(BRAND_SENTINEL)) hits.push({ file: path, line: i + 1 });
		});
	}
	return hits;
}
