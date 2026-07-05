import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { mkdirSync, writeFileSync, rmSync } from "fs";
import { join } from "path";

import { makeBosiaPlugin } from "../src/core/plugin.ts";
import { makeBosiaSvelteCompiler } from "../src/core/svelteCompiler.ts";
import { createInspectorBunPlugin } from "../src/core/plugins/inspector/bun-plugin.ts";

// Regression: production builds with `splitting: true` and many .svelte routes
// that all transitively import a shared app.css used to fail with
// "Multiple files share the same output path" because Bun emits identical CSS
// sidecars per dynamic-imported chunk. plugin.ts intercepts app.css → JS no-op
// so Tailwind's bundler never produces those sidecars.

const ROUTE_COUNT = 12;
let tmpDir: string;

beforeAll(() => {
	// Place fixture under packages/bosia so svelte resolves from this package's
	// node_modules — bosia-resolver looks up via `require.resolve("svelte", { paths: [process.cwd()] })`.
	tmpDir = join(import.meta.dir, "..", `.tmp-svelte-build-${Date.now()}`);
	mkdirSync(tmpDir, { recursive: true });
	mkdirSync(join(tmpDir, "src", "routes"), { recursive: true });

	writeFileSync(join(tmpDir, "tsconfig.json"), JSON.stringify({ compilerOptions: { paths: {} } }));
	// Match edupay-style app.css: tailwind directive + custom properties.
	// The substantive CSS body matters — Bun emits CSS sidecars when app.css
	// has real content, and they collide under splitting:true.
	writeFileSync(
		join(tmpDir, "src", "app.css"),
		`@import "tailwindcss";\n@source "../src";\n@theme { --color-x: hsl(0 0% 0%); }\n:root { --background: 0 0% 100%; --foreground: 0 0% 0%; --primary: 220 14% 12%; --radius: 0.5rem; }\n.dark { --background: 0 0% 0%; --foreground: 0 0% 100%; }\nbody { color: hsl(var(--foreground)); background: hsl(var(--background)); }\n`,
	);
	writeFileSync(
		join(tmpDir, "src", "routes", "+layout.svelte"),
		`<script>import "../app.css"; let { children } = $props();</script>{@render children()}`,
	);

	const entries: string[] = [];
	for (let i = 0; i < ROUTE_COUNT; i++) {
		const dir = join(tmpDir, "src", "routes", `r${i}`);
		mkdirSync(dir, { recursive: true });
		// Match edupay: each page imports the shared app.css transitively
		// (via a tiny shared util that imports it). The collision triggers
		// when Bun would otherwise emit a CSS sidecar per chunk.
		writeFileSync(
			join(dir, "+page.svelte"),
			`<script>import "../../shared.ts";</script><h1>Page ${i}</h1>`,
		);
		entries.push(`r${i}`);
	}
	writeFileSync(join(tmpDir, "src", "shared.ts"), `import "./app.css";\nexport {};\n`);

	// Mirror routes.client.ts: page + layout chain are SEPARATE dynamic imports
	// per route (not static), which is what triggers Bun to emit CSS sidecars
	// per chunk under splitting:true.
	const routesArr = entries
		.map(
			(r) =>
				`	{ page: () => import("./routes/${r}/+page.svelte"), layouts: [() => import("./routes/+layout.svelte")] },`,
		)
		.join("\n");
	writeFileSync(join(tmpDir, "src", "hydrate.ts"), `export const routes = [\n${routesArr}\n];\n`);
});

afterAll(() => {
	rmSync(tmpDir, { recursive: true, force: true });
});

describe("svelte build CSS collision regression", () => {
	test("browser build with many routes + shared app.css does not collide", async () => {
		const result = await Bun.build({
			entrypoints: [join(tmpDir, "src", "hydrate.ts")],
			outdir: join(tmpDir, "dist", "client"),
			target: "browser",
			splitting: true,
			naming: { chunk: "[name]-[hash].[ext]" },
			plugins: [makeBosiaPlugin("browser"), makeBosiaSvelteCompiler("browser")],
		});

		if (!result.success) {
			console.error("Build logs:", result.logs.map(String).join("\n"));
		}
		expect(result.success).toBe(true);

		const cssOutputs = result.outputs.filter((o) => o.path.endsWith(".css"));
		const cssNames = cssOutputs.map((o) => o.path.split("/").pop()!);
		expect(new Set(cssNames).size).toBe(cssNames.length);
	});

	test("server build succeeds with the same fixture", async () => {
		const result = await Bun.build({
			entrypoints: [join(tmpDir, "src", "hydrate.ts")],
			outdir: join(tmpDir, "dist", "server"),
			target: "bun",
			splitting: true,
			naming: { entry: "index.[ext]", chunk: "[name]-[hash].[ext]" },
			plugins: [makeBosiaPlugin("bun"), makeBosiaSvelteCompiler("bun")],
		});

		if (!result.success) {
			console.error("Build logs:", result.logs.map(String).join("\n"));
		}
		expect(result.success).toBe(true);
	});
});

// The dev inspector plugin does its own .svelte compile (to inject data-bosia-loc).
// It used to compile with css:"external" and hand-inject styles at runtime to dodge
// Bun's splitting CSS-chunk collision. It now uses css:"injected" (client), matching
// the prod compiler: Svelte embeds scoped CSS in the JS, so no CSS chunk is emitted
// and the collision class can't arise.
describe("dev inspector styled-component CSS injection", () => {
	let styledDir: string;

	beforeAll(() => {
		styledDir = join(import.meta.dir, "..", `.tmp-inspector-css-${Date.now()}`);
		mkdirSync(join(styledDir, "src", "routes"), { recursive: true });
		writeFileSync(
			join(styledDir, "tsconfig.json"),
			JSON.stringify({ compilerOptions: { paths: {} } }),
		);
		// One shared styled component imported by many same-named +page routes —
		// the exact fan-out that produced "Multiple files share the same output path".
		writeFileSync(
			join(styledDir, "src", "Styled.svelte"),
			`<div class="probe">x</div>\n<style>.probe{ animation: probe-blink 1s infinite } @keyframes probe-blink{50%{opacity:0}}</style>`,
		);
		const routesArr: string[] = [];
		for (let i = 0; i < ROUTE_COUNT; i++) {
			const dir = join(styledDir, "src", "routes", `r${i}`);
			mkdirSync(dir, { recursive: true });
			writeFileSync(
				join(dir, "+page.svelte"),
				`<script>import Styled from "../../Styled.svelte";</script><h1>Page ${i}</h1><Styled />`,
			);
			routesArr.push(`	{ page: () => import("./routes/r${i}/+page.svelte") },`);
		}
		writeFileSync(
			join(styledDir, "src", "hydrate.ts"),
			`export const routes = [\n${routesArr.join("\n")}\n];\n`,
		);
	});

	afterAll(() => {
		rmSync(styledDir, { recursive: true, force: true });
	});

	test("client build injects scoped CSS into JS, emits no CSS chunk, no collision", async () => {
		const result = await Bun.build({
			entrypoints: [join(styledDir, "src", "hydrate.ts")],
			outdir: join(styledDir, "dist", "client"),
			target: "browser",
			splitting: true,
			naming: { chunk: "[name]-[hash].[ext]" },
			// Inspector plugin registered BEFORE the svelte compiler, mirroring dev
			// (build.ts). dev:true so its .svelte onLoad wins.
			plugins: [
				makeBosiaPlugin("browser"),
				createInspectorBunPlugin({ cwd: styledDir, target: "browser", dev: true }),
				makeBosiaSvelteCompiler("browser"),
			],
		});

		if (!result.success) {
			console.error("Build logs:", result.logs.map(String).join("\n"));
		}
		expect(result.success).toBe(true);

		// css:"injected" → styles live in JS, no standalone CSS chunk.
		const cssOutputs = result.outputs.filter((o) => o.path.endsWith(".css"));
		expect(cssOutputs.length).toBe(0);

		// The scoped keyframe must actually ship — inside a JS chunk.
		const js = await Promise.all(
			result.outputs.filter((o) => o.path.endsWith(".js")).map((o) => o.text()),
		);
		expect(js.some((code) => code.includes("probe-blink"))).toBe(true);
	});
});
