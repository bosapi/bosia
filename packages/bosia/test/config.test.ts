import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { loadBosiaConfig, resetConfigCache } from "../src/core/config.ts";

let workdir: string;

beforeEach(() => {
	workdir = mkdtempSync(join(tmpdir(), "bosia-config-"));
	resetConfigCache();
});

afterEach(() => {
	rmSync(workdir, { recursive: true, force: true });
	resetConfigCache();
});

describe("loadBosiaConfig", () => {
	test("returns empty plugin list when no config file present", async () => {
		const cfg = await loadBosiaConfig(workdir);
		expect(cfg.plugins).toEqual([]);
	});

	test("loads bosia.config.ts and returns its default export", async () => {
		writeFileSync(
			join(workdir, "bosia.config.ts"),
			`export default { plugins: [{ name: "alpha" }, { name: "beta" }] };\n`,
		);
		const cfg = await loadBosiaConfig(workdir);
		expect(cfg.plugins?.map((p) => p.name)).toEqual(["alpha", "beta"]);
	});

	test("normalizes missing plugins array to []", async () => {
		writeFileSync(join(workdir, "bosia.config.ts"), `export default {};\n`);
		const cfg = await loadBosiaConfig(workdir);
		expect(cfg.plugins).toEqual([]);
	});

	test("keeps non-plugin fields like strictImports (source config)", async () => {
		writeFileSync(
			join(workdir, "bosia.config.ts"),
			`export default { plugins: [false, { name: "a" }], strictImports: false };\n`,
		);
		const cfg = await loadBosiaConfig(workdir);
		expect(cfg.strictImports).toBe(false);
		expect(cfg.plugins?.map((p) => p.name)).toEqual(["a"]);
	});

	test("keeps non-plugin fields like strictImports (prebuilt dist config)", async () => {
		mkdirSync(join(workdir, "dist"), { recursive: true });
		writeFileSync(
			join(workdir, "dist", "bosia.config.js"),
			`export default { plugins: [null, { name: "b" }], strictImports: { unbound: false } };\n`,
		);
		const cfg = await loadBosiaConfig(workdir);
		expect(cfg.strictImports).toEqual({ unbound: false });
		expect(cfg.plugins?.map((p) => p.name)).toEqual(["b"]);
	});

	test("throws when default export is not an object", async () => {
		writeFileSync(join(workdir, "bosia.config.ts"), `export default 42;\n`);
		await expect(loadBosiaConfig(workdir)).rejects.toThrow(/must export a default object/);
	});
});
