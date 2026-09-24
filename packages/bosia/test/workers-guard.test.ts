import { describe, test, expect, beforeAll, afterAll, afterEach } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "fs";
import { join } from "path";

import { findWorkersIncompatible, workersGuardReport } from "../src/core/workersGuard.ts";

let src: string;

function put(rel: string, code: string) {
	mkdirSync(join(src, rel, ".."), { recursive: true });
	writeFileSync(join(src, rel), code);
}

beforeAll(() => {
	src = join(import.meta.dir, "..", `.tmp-workers-guard-${Date.now()}`, "src");
	put(
		"hooks.server.ts",
		`export const handle = ({ event, resolve }) => {\n\tconsole.log(Bun.version);\n\treturn resolve(event);\n};\n`,
	);
	put(
		"routes/+page.server.ts",
		`import { readFileSync } from "node:fs";\nexport const load = () => ({ a: readFileSync("x") });\n`,
	);
	put(
		"routes/api/+server.ts",
		`import { Database } from "bun:sqlite";\nexport const GET = () => new Response(String(Database));\n`,
	);
	put("lib/server/db.ts", `export const f = () => Bun.file("x");\n`);
	// Not flagged: type-only import, typeof guard, comment, and a non-server file.
	put(
		"routes/ok/+page.server.ts",
		`import type { S3Client } from "bun";\n// Bun.file would break here\nexport const load = () => ({ bun: typeof Bun !== "undefined" ? Bun.version : null });\n`,
	);
	put("lib/client.ts", `export const v = Bun.version;\n`);
	put("routes/ok/+page.svelte", `<p>{Bun}</p>\n`);
});

afterAll(() => {
	rmSync(join(src, ".."), { recursive: true, force: true });
});

afterEach(() => {
	delete process.env.BOSIA_WORKERS_GUARD;
});

describe("workers guard", () => {
	test("flags Bun globals, fs and bun: imports in server files only", () => {
		const hits = findWorkersIncompatible(src).map(
			(h) => `${h.file.slice(src.length + 1)}:${h.line}:${h.col}`,
		);
		expect(hits.sort()).toEqual(
			[
				"hooks.server.ts:2:14",
				"routes/+page.server.ts:1:30",
				"routes/api/+server.ts:1:26",
				"lib/server/db.ts:1:24",
			].sort(),
		);
	});

	test("report fails by default, warns with BOSIA_WORKERS_GUARD=0", () => {
		expect(workersGuardReport(src)).toContain("uses Bun.version");
		process.env.BOSIA_WORKERS_GUARD = "0";
		expect(workersGuardReport(src)).toBeNull();
	});

	test("missing src/ is clean", () => {
		expect(findWorkersIncompatible(join(src, "nope"))).toEqual([]);
	});
});
