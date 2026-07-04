import { describe, expect, test } from "bun:test";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { finalizeTailwindCss, TW_TEMP_BASENAME } from "../src/core/twHash.ts";

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
});
