import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { generateEnvModules } from "../src/core/envCodegen.ts";
import type { ClassifiedEnv } from "../src/core/env.ts";

let originalCwd: string;
let tmpDir: string;

beforeEach(() => {
	originalCwd = process.cwd();
	tmpDir = mkdtempSync(join(tmpdir(), "bosia-envgen-"));
	process.chdir(tmpDir);
});

afterEach(() => {
	process.chdir(originalCwd);
	rmSync(tmpDir, { recursive: true, force: true });
});

function read(rel: string): string {
	return readFileSync(join(tmpDir, ".bosia", rel), "utf-8");
}

const empty: ClassifiedEnv = {
	publicStatic: {},
	publicDynamic: {},
	privateStatic: {},
	privateDynamic: {},
};

describe("generateEnvModules() — server output", () => {
	test("PUBLIC_STATIC_* inlined as literal strings", () => {
		generateEnvModules({
			...empty,
			publicStatic: { PUBLIC_STATIC_API: "https://api.example.com" },
		});
		const out = read("env.server.ts");
		expect(out).toContain('export const PUBLIC_STATIC_API = "https://api.example.com";');
	});

	test("PUBLIC_* dynamic uses process.env at runtime", () => {
		generateEnvModules({ ...empty, publicDynamic: { PUBLIC_FLAG: "x" } });
		const out = read("env.server.ts");
		expect(out).toContain('export const PUBLIC_FLAG = process.env.PUBLIC_FLAG ?? "";');
	});

	test("STATIC_* private inlined", () => {
		generateEnvModules({ ...empty, privateStatic: { STATIC_KEY: "secret" } });
		const out = read("env.server.ts");
		expect(out).toContain('export const STATIC_KEY = "secret";');
	});

	test("private dynamic uses process.env", () => {
		generateEnvModules({ ...empty, privateDynamic: { DB_URL: "x" } });
		const out = read("env.server.ts");
		expect(out).toContain('export const DB_URL = process.env.DB_URL ?? "";');
	});
});

describe("generateEnvModules() — client output", () => {
	test("only PUBLIC_* vars exported (no private)", () => {
		generateEnvModules({
			publicStatic: { PUBLIC_STATIC_X: "a" },
			publicDynamic: { PUBLIC_Y: "b" },
			privateStatic: { STATIC_SECRET: "leak" },
			privateDynamic: { SECRET: "leak" },
		});
		const out = read("env.client.ts");
		expect(out).toContain('export const PUBLIC_STATIC_X = "a";');
		expect(out).toContain('export const PUBLIC_Y = __env.PUBLIC_Y ?? "";');
		expect(out).not.toContain("STATIC_SECRET");
		expect(out).not.toContain("SECRET");
	});

	test("dynamic public reads from window.__BOSIA_ENV__", () => {
		generateEnvModules({ ...empty, publicDynamic: { PUBLIC_FOO: "x" } });
		const out = read("env.client.ts");
		expect(out).toContain("__BOSIA_ENV__");
		expect(out).toContain("export const PUBLIC_FOO = __env.PUBLIC_FOO");
	});
});

describe("generateEnvModules() — types output", () => {
	test("declares all keys as string", () => {
		generateEnvModules({
			publicStatic: { PUBLIC_STATIC_X: "a" },
			publicDynamic: { PUBLIC_Y: "b" },
			privateStatic: { STATIC_Z: "c" },
			privateDynamic: { DB_URL: "d" },
		});
		const out = readFileSync(join(tmpDir, ".bosia", "types", "env.d.ts"), "utf-8");
		expect(out).toContain("declare module '$env'");
		expect(out).toContain("export const PUBLIC_STATIC_X: string;");
		expect(out).toContain("export const PUBLIC_Y: string;");
		expect(out).toContain("export const STATIC_Z: string;");
		expect(out).toContain("export const DB_URL: string;");
	});

	test("empty input still writes valid module declaration", () => {
		generateEnvModules(empty);
		const out = readFileSync(join(tmpDir, ".bosia", "types", "env.d.ts"), "utf-8");
		expect(out).toContain("declare module '$env'");
	});
});
