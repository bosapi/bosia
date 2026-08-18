import { describe, expect, test } from "bun:test";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { finalizeTailwindCss, TW_TEMP_BASENAME } from "../src/core/twHash.ts";
import { resetBaseCache } from "../src/core/appBase.ts";

describe("finalizeTailwindCss", () => {
	test("renames temp file to a deterministic content-hashed name", () => {
		const dir = mkdtempSync(join(tmpdir(), "bosia-tw-"));
		try {
			const temp = join(dir, TW_TEMP_BASENAME);
			writeFileSync(temp, "body{color:red}");
			const name = finalizeTailwindCss(temp);

			expect(name).toMatch(/^bosia-tw-[a-f0-9]{10}\.css$/);
			expect(existsSync(join(dir, name))).toBe(true);
			expect(existsSync(temp)).toBe(false);

			// Same content → same hash (rebuild keeps browser cache warm).
			writeFileSync(temp, "body{color:red}");
			expect(finalizeTailwindCss(temp)).toBe(name);

			// Different content → different hash (cache busts).
			writeFileSync(temp, "body{color:blue}");
			expect(finalizeTailwindCss(temp)).not.toBe(name);
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	});

	// build.ts calls loadEnv() *after* its imports, so a BASE_PATH that lives in
	// .env.production is not in process.env when this module loads. Reading the
	// base at import time meant the CSS silently kept its origin-root url()s —
	// fallback font, blank mask-image icon, nothing in the console.
	test("reads BASE_PATH when called, not when imported", () => {
		const dir = mkdtempSync(join(tmpdir(), "bosia-tw-base-"));
		const original = process.env.BASE_PATH;
		try {
			process.env.BASE_PATH = "/sso";
			resetBaseCache();

			const temp = join(dir, TW_TEMP_BASENAME);
			writeFileSync(temp, `@font-face{src:url("/fonts/x.woff2")}`);
			const name = finalizeTailwindCss(temp);

			expect(readFileSync(join(dir, name), "utf-8")).toContain(`url("/sso/fonts/x.woff2")`);
		} finally {
			if (original === undefined) delete process.env.BASE_PATH;
			else process.env.BASE_PATH = original;
			resetBaseCache();
			rmSync(dir, { recursive: true, force: true });
		}
	});
});
