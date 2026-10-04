import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtempSync, readdirSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { cachedCompile } from "../src/core/svelteCompiler.ts";

let dir: string;
const saved = process.env.BOSIA_SVELTE_CACHE_DIR;

beforeEach(() => {
	dir = mkdtempSync(join(tmpdir(), "bosia-svelte-cache-"));
	process.env.BOSIA_SVELTE_CACHE_DIR = dir;
});

afterEach(() => {
	if (saved === undefined) delete process.env.BOSIA_SVELTE_CACHE_DIR;
	else process.env.BOSIA_SVELTE_CACHE_DIR = saved;
	rmSync(dir, { recursive: true, force: true });
});

describe("cachedCompile()", () => {
	test("the same key is compiled once and then read back", async () => {
		let builds = 0;
		const build = () => ({ code: `compiled #${++builds}` });
		const first = await cachedCompile(["a.svelte", "client", "<p>a</p>"], build);
		const second = await cachedCompile(["a.svelte", "client", "<p>a</p>"], build);
		expect(first).toEqual({ value: { code: "compiled #1" }, hit: false });
		expect(second).toEqual({ value: { code: "compiled #1" }, hit: true });
		expect(builds).toBe(1);
	});

	test("an edited source or another target is a miss", async () => {
		let builds = 0;
		const build = () => ({ n: ++builds });
		await cachedCompile(["a.svelte", "client", "<p>a</p>"], build);
		expect((await cachedCompile(["a.svelte", "client", "<p>b</p>"], build)).hit).toBe(false);
		expect((await cachedCompile(["a.svelte", "server", "<p>a</p>"], build)).hit).toBe(false);
		expect(builds).toBe(3);
		expect(readdirSync(dir)).toHaveLength(3);
	});

	test("without BOSIA_SVELTE_CACHE_DIR every call compiles and nothing is written", async () => {
		delete process.env.BOSIA_SVELTE_CACHE_DIR;
		let builds = 0;
		const build = () => ({ n: ++builds });
		await cachedCompile(["a.svelte"], build);
		await cachedCompile(["a.svelte"], build);
		expect(builds).toBe(2);
		expect(readdirSync(dir)).toHaveLength(0);
	});
});
