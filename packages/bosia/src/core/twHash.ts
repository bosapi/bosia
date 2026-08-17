import { readFileSync, renameSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { rebaseCssUrls } from "./basePath.ts";
import { BASE_PATH } from "./paths.ts";

/** Temp filename Tailwind CLI writes to before the content-hash rename. */
export const TW_TEMP_BASENAME = ".bosia-tw.build.css";

/**
 * Content-hash the compiled Tailwind CSS and rename it to its final
 * `bosia-tw-<hash>.css` name (matches staticManifest's HASHED_BASENAME rule,
 * so it gets immutable caching). Returns the final basename.
 */
export function finalizeTailwindCss(tempPath: string): string {
	// Rebase before hashing, so the hash describes the bytes actually served. A
	// @font-face src or mask-image written as url(/fonts/…) resolves against the
	// origin and would land outside the mount — silently, as a fallback font or a
	// blank icon rather than an error.
	if (BASE_PATH) {
		const rebased = rebaseCssUrls(BASE_PATH, readFileSync(tempPath, "utf-8"));
		writeFileSync(tempPath, rebased);
	}

	const bytes = readFileSync(tempPath);
	const hash = new Bun.CryptoHasher("sha256").update(bytes).digest("hex").slice(0, 10);
	const name = `bosia-tw-${hash}.css`;
	renameSync(tempPath, join(dirname(tempPath), name));
	return name;
}
