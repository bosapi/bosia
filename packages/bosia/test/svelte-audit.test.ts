import { describe, test, expect, beforeAll, afterAll, afterEach } from "bun:test";
import { mkdirSync, writeFileSync, rmSync } from "fs";
import { join } from "path";

import { makeBosiaPlugin } from "../src/core/plugin.ts";
import { makeBosiaSvelteCompiler, resetSvelteAuditCache } from "../src/core/svelteCompiler.ts";
import { resetResolveImportCache } from "../src/core/resolveImport.ts";
import { resetConfigCache } from "../src/core/config.ts";

// The audit runs inside the svelte compiler plugin's `onLoad`. We build a
// minimal app fixture in a fresh tmpdir, then call `Bun.build` and assert on
// `result.success` and the captured `result.logs`. Mirrors the structure of
// `svelte-build.test.ts`.

let tmpDir: string;
let originalCwd: string;
const originalEnv = process.env.BOSIA_STRICT_IMPORTS;

function buildFixture(files: Record<string, string>): string {
	const dir = join(
		import.meta.dir,
		"..",
		`.tmp-svelte-audit-${Date.now()}-${Math.random().toString(36).slice(2)}`,
	);
	mkdirSync(dir, { recursive: true });
	for (const [rel, content] of Object.entries(files)) {
		const abs = join(dir, rel);
		mkdirSync(join(abs, ".."), { recursive: true });
		writeFileSync(abs, content);
	}
	return dir;
}

interface BuildOutcome {
	success: boolean;
	logs: string;
}

async function runBuild(dir: string): Promise<BuildOutcome> {
	process.chdir(dir);
	resetResolveImportCache();
	resetSvelteAuditCache();
	resetConfigCache();
	// `throw: false` keeps Bun from re-throwing onLoad exceptions — they land
	// in `result.logs` instead (as BuildMessage entries) so each test can
	// assert on a uniform string blob.
	const result = await Bun.build({
		entrypoints: [join(dir, "src", "hydrate.ts")],
		outdir: join(dir, "dist", "server"),
		target: "bun",
		throw: false,
		splitting: false,
		naming: { entry: "index.[ext]", chunk: "[name]-[hash].[ext]" },
		plugins: [makeBosiaPlugin("bun"), makeBosiaSvelteCompiler("bun")],
	});
	return {
		success: result.success,
		logs: result.logs.map(String).join("\n"),
	};
}

const TSCONFIG = JSON.stringify({
	compilerOptions: { paths: { "$lib/*": ["src/lib/*"] } },
});

const HYDRATE = `export const routes = [{ page: () => import("./routes/+page.svelte"), layouts: [] }];\n`;

beforeAll(() => {
	originalCwd = process.cwd();
});

afterEach(() => {
	if (tmpDir) rmSync(tmpDir, { recursive: true, force: true });
	process.chdir(originalCwd);
	if (originalEnv === undefined) delete process.env.BOSIA_STRICT_IMPORTS;
	else process.env.BOSIA_STRICT_IMPORTS = originalEnv;
});

afterAll(() => {
	process.chdir(originalCwd);
});

describe("svelte component-import audit", () => {
	test("missing namespace export fails the build with a clear message", async () => {
		tmpDir = buildFixture({
			"tsconfig.json": TSCONFIG,
			"src/lib/components/card/index.ts": `
				export const Card = (() => null) as unknown as any;
				export const CardContent = (() => null) as unknown as any;
			`,
			"src/hydrate.ts": HYDRATE,
			"src/routes/+page.svelte": `
<script>
	import * as Card from "$lib/components/card/index.ts";
</script>
<Card.Root>hi</Card.Root>
			`,
		});

		const result = await runBuild(tmpDir);
		expect(result.success).toBe(false);
		expect(result.logs).toContain("Card.Root");
		expect(result.logs).toContain("has no export `Root`");
		expect(result.logs).toContain("Available exports: Card, CardContent");
	});

	test("namespace import + correct member succeeds", async () => {
		tmpDir = buildFixture({
			"tsconfig.json": TSCONFIG,
			"src/lib/components/card/index.ts": `
				export const Card = (() => null) as unknown as any;
				export const CardContent = (() => null) as unknown as any;
			`,
			"src/hydrate.ts": HYDRATE,
			"src/routes/+page.svelte": `
<script>
	import * as C from "$lib/components/card/index.ts";
</script>
<C.Card>hi</C.Card>
			`,
		});

		const result = await runBuild(tmpDir);
		if (!result.success) console.error(result.logs);
		expect(result.success).toBe(true);
	});

	test("named import + plain usage succeeds", async () => {
		tmpDir = buildFixture({
			"tsconfig.json": TSCONFIG,
			"src/lib/components/card/index.ts": `
				export const Card = (() => null) as unknown as any;
			`,
			"src/hydrate.ts": HYDRATE,
			"src/routes/+page.svelte": `
<script>
	import { Card } from "$lib/components/card/index.ts";
</script>
<Card>hi</Card>
			`,
		});

		const result = await runBuild(tmpDir);
		if (!result.success) console.error(result.logs);
		expect(result.success).toBe(true);
	});

	test("unbound identifier fails", async () => {
		tmpDir = buildFixture({
			"tsconfig.json": TSCONFIG,
			"src/hydrate.ts": HYDRATE,
			"src/routes/+page.svelte": `<Mystery>x</Mystery>`,
		});

		const result = await runBuild(tmpDir);
		expect(result.success).toBe(false);
		expect(result.logs).toContain("Mystery");
		expect(result.logs).toContain("not imported or declared");
	});

	test("dotted usage on a default import fails", async () => {
		tmpDir = buildFixture({
			"tsconfig.json": TSCONFIG,
			"src/lib/components/card/index.ts": `
				const Card = (() => null) as unknown as any;
				export default Card;
			`,
			"src/hydrate.ts": HYDRATE,
			"src/routes/+page.svelte": `
<script>
	import Card from "$lib/components/card/index.ts";
</script>
<Card.Root>x</Card.Root>
			`,
		});

		const result = await runBuild(tmpDir);
		expect(result.success).toBe(false);
		expect(result.logs).toContain("only namespace imports");
	});

	test("each-block shadowing avoids false positive", async () => {
		tmpDir = buildFixture({
			"tsconfig.json": TSCONFIG,
			"src/hydrate.ts": HYDRATE,
			"src/routes/+page.svelte": `
<script>
	let items = $state([]);
</script>
{#each items as Item}<Item />{/each}
			`,
		});

		const result = await runBuild(tmpDir);
		if (!result.success) console.error(result.logs);
		expect(result.success).toBe(true);
	});

	test("bare-package namespace import is skipped (no false positive)", async () => {
		tmpDir = buildFixture({
			"tsconfig.json": TSCONFIG,
			// Stub the bare package so Bun can resolve it — the audit must skip
			// member validation for bare specifiers regardless of installed state,
			// but providing a stub lets us assert the build succeeds end-to-end.
			"node_modules/lucide-svelte/package.json": JSON.stringify({
				name: "lucide-svelte",
				main: "index.js",
			}),
			"node_modules/lucide-svelte/index.js": `export const Bell = () => null;\n`,
			"src/hydrate.ts": HYDRATE,
			"src/routes/+page.svelte": `
<script>
	import * as Icons from "lucide-svelte";
</script>
<Icons.Bell />
			`,
		});

		const result = await runBuild(tmpDir);
		// The audit must NOT flag <Icons.Bell>; what matters is the audit doesn't
		// emit its own failure. (The build's success itself depends on Bun's
		// resolution working, which the stub provides.)
		expect(result.logs).not.toContain("Svelte component-import audit failed");
	});

	test("BOSIA_STRICT_IMPORTS=0 downgrades audit failures to warnings", async () => {
		tmpDir = buildFixture({
			"tsconfig.json": TSCONFIG,
			"src/lib/components/card/index.ts": `
				export const Card = (() => null) as unknown as any;
			`,
			"src/hydrate.ts": HYDRATE,
			"src/routes/+page.svelte": `
<script>
	import * as Card from "$lib/components/card/index.ts";
</script>
<Card.Root>x</Card.Root>
			`,
		});

		process.env.BOSIA_STRICT_IMPORTS = "0";
		const result = await runBuild(tmpDir);
		// Audit downgraded — build should succeed at the audit step. (The svelte
		// compile itself can still produce warnings, but that's separate.)
		expect(result.logs).not.toContain("Svelte component-import audit failed");
	});
});
