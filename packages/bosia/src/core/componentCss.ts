import { writeFileSync } from "fs";
import { join } from "path";
import { rebaseCssUrls } from "./basePath.ts";
import { currentBase } from "./appBase.ts";

/**
 * Scoped `<style>` blocks harvested from every `.svelte` file the client build
 * touches, keyed by absolute source path so a recompile of the same file
 * replaces its rules rather than appending a second copy.
 *
 * Why a hand-rolled collector rather than letting Bun emit the CSS: with
 * `splitting: true` a `css: "external"` compile makes Bun write one CSS sidecar
 * per dynamic-imported chunk, which is the "Multiple files share the same
 * output path" failure that 0.4.4 fought (see `test/svelte-build.test.ts`).
 * Collecting here keeps the client build's CSS-output count at zero — the
 * invariant that test pins — while still producing a real stylesheet.
 */
const collected = new Map<string, string>();

export function collectComponentCss(filePath: string, css: string): void {
	collected.set(filePath, css);
}

/**
 * Concatenate everything collected into one content-hashed stylesheet in
 * `clientDir`, and return its basename — or `null` when the app has no scoped
 * styles at all, in which case nothing is written and nothing is linked.
 *
 * Mirrors `finalizeTailwindCss` (twHash.ts) deliberately: same rebase-then-hash
 * order, same hash length, same `-<hash>.css` shape that staticManifest's
 * HASHED_BASENAME rule reads as immutable.
 */
export function finalizeComponentCss(clientDir: string): string | null {
	if (collected.size === 0) return null;

	// Sorted by path: the bundler visits modules in whatever order resolution
	// happens to take, and an unstable order means an unstable hash means every
	// build busts a cache that did not need busting.
	const css = [...collected.keys()]
		.sort()
		.map((k) => collected.get(k)!)
		.join("\n");

	// Rebase before hashing, so the hash describes the bytes actually served —
	// same reasoning as twHash: a `url(/img/x.png)` inside a component's
	// `<style>` resolves against the origin and would land outside the mount.
	const base = currentBase();
	const bytes = base ? rebaseCssUrls(base, css) : css;

	const hash = new Bun.CryptoHasher("sha256").update(bytes).digest("hex").slice(0, 10);
	const name = `bosia-css-${hash}.css`;
	writeFileSync(join(clientDir, name), bytes);
	return name;
}
