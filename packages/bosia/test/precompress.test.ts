import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs";
import { brotliDecompressSync, gunzipSync } from "node:zlib";
import { tmpdir } from "os";
import { join } from "path";
import { precompressDir } from "../src/core/precompress.ts";

let dir: string;

beforeEach(() => {
	dir = mkdtempSync(join(tmpdir(), "bosia-precompress-"));
});

afterEach(() => {
	rmSync(dir, { recursive: true, force: true });
});

function write(rel: string, body: string | Uint8Array) {
	const abs = join(dir, rel);
	mkdirSync(join(abs, ".."), { recursive: true });
	writeFileSync(abs, body);
	return abs;
}

describe("precompressDir", () => {
	test("writes .br and .gz that decode back to the original", async () => {
		const body = "export const x = 'hello world';\n".repeat(200);
		const abs = write("nested/chunk-abc.js", body);

		const stats = await precompressDir(dir);

		expect(stats.files).toBe(1);
		expect(brotliDecompressSync(readFileSync(`${abs}.br`)).toString()).toBe(body);
		expect(gunzipSync(readFileSync(`${abs}.gz`)).toString()).toBe(body);
		expect(stats.brBytes).toBeLessThan(stats.rawBytes);
	});

	test("skips small files and non-compressible extensions", async () => {
		const small = write("tiny.js", "x");
		const png = write("img.png", "p".repeat(5000));

		await precompressDir(dir);

		expect(existsSync(`${small}.br`)).toBe(false);
		expect(existsSync(`${png}.br`)).toBe(false);
	});

	test("does not write a variant that would be larger than the original", async () => {
		const noise = new Uint8Array(4096);
		crypto.getRandomValues(noise);
		const abs = write("noise.json", noise);

		await precompressDir(dir);

		expect(existsSync(`${abs}.br`)).toBe(false);
		expect(existsSync(`${abs}.gz`)).toBe(false);
	});

	test("missing dir is a no-op", async () => {
		expect((await precompressDir(join(dir, "nope"))).files).toBe(0);
	});
});
