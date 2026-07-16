import { test, expect } from "bun:test";
import { join } from "path";
import { affectsRouteManifest, shouldIgnoreForRebuild } from "../src/core/devWatch.ts";

const ROUTES = join("/app", "src", "routes");

test("shouldIgnoreForRebuild skips docs, tests, and editor droppings", () => {
	expect(shouldIgnoreForRebuild("/app/src/notes.md")).toBe(true);
	expect(shouldIgnoreForRebuild("/app/src/README.markdown")).toBe(true);
	expect(shouldIgnoreForRebuild("/app/src/lib/utils.test.ts")).toBe(true);
	expect(shouldIgnoreForRebuild("/app/src/lib/Widget.spec.tsx")).toBe(true);
	expect(shouldIgnoreForRebuild("/app/src/.DS_Store")).toBe(true);
	expect(shouldIgnoreForRebuild("/app/src/routes/.+page.svelte.swp")).toBe(true);
	expect(shouldIgnoreForRebuild("/app/src/lib/db.ts~")).toBe(true);
	expect(shouldIgnoreForRebuild("/app/src/upload.tmp")).toBe(true);
});

test("shouldIgnoreForRebuild keeps real source files", () => {
	expect(shouldIgnoreForRebuild("/app/src/lib/utils.ts")).toBe(false);
	expect(shouldIgnoreForRebuild("/app/src/routes/+page.svelte")).toBe(false);
	expect(shouldIgnoreForRebuild("/app/src/app.css")).toBe(false);
	expect(shouldIgnoreForRebuild("/app/src/lib/latest.ts")).toBe(false); // "test" substring, not .test.
	expect(shouldIgnoreForRebuild("/app/src/data.json")).toBe(false);
});

test("affectsRouteManifest flags + files and directories under src/routes", () => {
	expect(affectsRouteManifest(join(ROUTES, "blog", "+page.svelte"), ROUTES)).toBe(true);
	expect(affectsRouteManifest(join(ROUTES, "+layout.server.ts"), ROUTES)).toBe(true);
	expect(affectsRouteManifest(join(ROUTES, "api", "+server.ts"), ROUTES)).toBe(true);
	// Group/param folder rename or delete — no extension, treated as a directory
	expect(affectsRouteManifest(join(ROUTES, "(admin)"), ROUTES)).toBe(true);
	expect(affectsRouteManifest(join(ROUTES, "blog", "[slug]"), ROUTES)).toBe(true);
	// The routes dir itself
	expect(affectsRouteManifest(ROUTES, ROUTES)).toBe(true);
});

test("affectsRouteManifest clears colocated files and everything outside routes", () => {
	expect(affectsRouteManifest(join(ROUTES, "blog", "Card.svelte"), ROUTES)).toBe(false);
	expect(affectsRouteManifest(join(ROUTES, "checkout", "cart.ts"), ROUTES)).toBe(false);
	expect(affectsRouteManifest("/app/src/lib/db.ts", ROUTES)).toBe(false);
	expect(affectsRouteManifest("/app/src/app.css", ROUTES)).toBe(false);
	// Sibling dir sharing the prefix must not match
	expect(affectsRouteManifest("/app/src/routes-old/+page.svelte", ROUTES)).toBe(false);
});
