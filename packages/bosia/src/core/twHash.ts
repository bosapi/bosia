import { readFileSync, renameSync } from "fs";
import { join, dirname } from "path";

/** Temp filename Tailwind CLI writes to before the content-hash rename. */
export const TW_TEMP_BASENAME = ".bosia-tw.build.css";

/**
 * Content-hash the compiled Tailwind CSS and rename it to its final
 * `bosia-tw-<hash>.css` name (matches staticManifest's HASHED_BASENAME rule,
 * so it gets immutable caching). Returns the final basename.
 */
export function finalizeTailwindCss(tempPath: string): string {
	const bytes = readFileSync(tempPath);
	const hash = new Bun.CryptoHasher("sha256").update(bytes).digest("hex").slice(0, 10);
	const name = `bosia-tw-${hash}.css`;
	renameSync(tempPath, join(dirname(tempPath), name));
	return name;
}
