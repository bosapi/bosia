import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import {
	parseEnvFile,
	classifyEnvVars,
	loadEnv,
	getDeclaredEnvKeys,
	resetDeclaredKeys,
} from "../src/core/env.ts";

describe("parseEnvFile", () => {
	test("unquoted basic", () => {
		expect(parseEnvFile("FOO=bar\nBAZ=qux")).toEqual({ FOO: "bar", BAZ: "qux" });
	});

	test("skips blanks and # comments", () => {
		expect(parseEnvFile("# c\n\nFOO=bar\n# trailing")).toEqual({ FOO: "bar" });
	});

	test("double-quoted with escape sequences", () => {
		expect(parseEnvFile(`MSG="line1\\nline2\\t!"`).MSG).toBe("line1\nline2\t!");
	});

	test("single-quoted is literal", () => {
		expect(parseEnvFile(`MSG='line1\\nline2'`).MSG).toBe("line1\\nline2");
	});

	test("strips inline comment after closing double-quote", () => {
		expect(parseEnvFile(`KEY="value" # note`).KEY).toBe("value");
	});

	test("strips inline comment after closing single-quote", () => {
		expect(parseEnvFile(`KEY='value' # note`).KEY).toBe("value");
	});

	test("# inside quotes is literal", () => {
		expect(parseEnvFile(`KEY="a#b"`).KEY).toBe("a#b");
	});

	test("foo#bar without preceding space preserved (unquoted)", () => {
		expect(parseEnvFile("KEY=foo#bar").KEY).toBe("foo#bar");
	});

	test("rejects invalid identifier names", () => {
		expect(() => parseEnvFile("123BAD=x")).toThrow(/Invalid env variable name/);
		expect(() => parseEnvFile("FOO-BAR=x")).toThrow(/Invalid env variable name/);
	});

	test("accepts underscores and digits in name", () => {
		expect(parseEnvFile("_X=1\nFOO_BAR_2=y")).toEqual({ _X: "1", FOO_BAR_2: "y" });
	});

	test("ignores lines without =", () => {
		expect(parseEnvFile("NOEQUALS\nFOO=bar")).toEqual({ FOO: "bar" });
	});
});

describe("classifyEnvVars", () => {
	test("buckets by prefix", () => {
		const c = classifyEnvVars({
			PUBLIC_STATIC_API: "1",
			PUBLIC_FLAG: "2",
			STATIC_KEY: "3",
			SECRET: "4",
		});
		expect(c.publicStatic).toEqual({ PUBLIC_STATIC_API: "1" });
		expect(c.publicDynamic).toEqual({ PUBLIC_FLAG: "2" });
		expect(c.privateStatic).toEqual({ STATIC_KEY: "3" });
		expect(c.privateDynamic).toEqual({ SECRET: "4" });
	});
});

describe("loadEnv", () => {
	let tmpDir: string;
	const touched = [
		"PUBLIC_GTM_ID",
		"TEST_MODE_VALUE",
		"PUBLIC_FROM_EXAMPLE",
		"TEST_NAME_ONLY",
	] as const;

	function write(name: string, content: string) {
		writeFileSync(join(tmpDir, name), content);
	}

	beforeEach(() => {
		tmpDir = mkdtempSync(join(tmpdir(), "bosia-loadenv-"));
		resetDeclaredKeys();
		for (const k of touched) delete process.env[k];
	});

	afterEach(() => {
		rmSync(tmpDir, { recursive: true, force: true });
		resetDeclaredKeys();
		for (const k of touched) delete process.env[k];
	});

	test(".env.production alone still exports the name in development mode", () => {
		write(".env.production", "PUBLIC_GTM_ID=GTM-XYZ");
		const env = loadEnv("development", tmpDir);
		expect(env.PUBLIC_GTM_ID).toBe("");
		expect(getDeclaredEnvKeys().has("PUBLIC_GTM_ID")).toBe(true);
	});

	test("values stay mode-scoped", () => {
		write(".env", "TEST_MODE_VALUE=dev");
		write(".env.production", "TEST_MODE_VALUE=prod");
		expect(loadEnv("development", tmpDir).TEST_MODE_VALUE).toBe("dev");
	});

	test(".env.example contributes names", () => {
		write(".env.example", "PUBLIC_FROM_EXAMPLE=placeholder");
		expect(loadEnv("development", tmpDir).PUBLIC_FROM_EXAMPLE).toBe("");
	});

	test("non-.env files are ignored", () => {
		write(".envrc", "export A-B=1");
		expect(() => loadEnv("development", tmpDir)).not.toThrow();
	});

	test("name-only keys are not applied to process.env", () => {
		write(".env.production", "TEST_NAME_ONLY=x");
		loadEnv("development", tmpDir);
		expect(process.env.TEST_NAME_ONLY).toBeUndefined();
	});

	test("system env fills a name-only key", () => {
		process.env.PUBLIC_GTM_ID = "from-shell";
		write(".env.production", "PUBLIC_GTM_ID=GTM-XYZ");
		expect(loadEnv("development", tmpDir).PUBLIC_GTM_ID).toBe("from-shell");
	});

	test("malformed off-mode file throws", () => {
		write(".env.production", "FOO-BAR=x");
		expect(() => loadEnv("development", tmpDir)).toThrow(/Invalid env variable name/);
	});
});
