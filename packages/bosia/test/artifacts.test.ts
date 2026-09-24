import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { readArtifact } from "../src/core/artifacts.ts";
import { generateArtifactsModule, generateWorkersRuntime } from "../src/core/workersCodegen.ts";
import { makeBosiaPlugin } from "../src/core/plugin.ts";

let workdir: string;
let cwdBefore: string;

beforeEach(() => {
	workdir = mkdtempSync(join(tmpdir(), "bosia-artifacts-"));
	cwdBefore = process.cwd();
	process.chdir(workdir);
	mkdirSync(join(workdir, "dist"));
	writeFileSync(
		join(workdir, "dist", "manifest.json"),
		`{"entry":"hydrate-abc.js","publicEnv":["PUBLIC_A"]}`,
	);
	writeFileSync(join(workdir, "dist", "app-html.json"), `{"headOpen":"<head>"}`);
});

afterEach(() => {
	process.chdir(cwdBefore);
	rmSync(workdir, { recursive: true, force: true });
});

describe("readArtifact", () => {
	test("parses a present artifact, undefined for missing or corrupt", () => {
		writeFileSync(join(workdir, "dist", "route-manifest.json"), "{not json");
		expect(readArtifact<{ entry: string }>("manifest.json", "dist")?.entry).toBe("hydrate-abc.js");
		expect(readArtifact("route-manifest.json", "dist")).toBeUndefined();
		expect(readArtifact("nope.json", "dist")).toBeUndefined();
	});
});

describe("generateArtifactsModule", () => {
	test("inlines the same JSON the filesystem reader returns", async () => {
		const target = generateArtifactsModule("dist", workdir);
		const inlined = await import(target);
		for (const name of ["manifest.json", "app-html.json", "route-manifest.json"]) {
			expect(inlined.readArtifact(name)).toEqual(readArtifact(name, "dist"));
		}
	});

	test("workers runtime bundles the inlined module instead of the fs reader", async () => {
		generateArtifactsModule("dist", workdir);
		const entry = join(import.meta.dir, "..", "src", "core", "appHtml.ts");
		const build = (runtime: "bun" | "workers") =>
			Bun.build({
				entrypoints: [entry],
				target: "bun",
				external: ["fs", "path"],
				plugins: [makeBosiaPlugin("bun", runtime)],
			}).then((r) => r.outputs[0].text());

		const workers = await build("workers");
		expect(workers).toContain("hydrate-abc.js");
		expect(workers).not.toContain("JSON.parse(readFileSync");
		expect(await build("bun")).toContain("JSON.parse(readFileSync");
	});
});

describe("generateWorkersRuntime", () => {
	test("statically re-exports the app's hooks handle and config", async () => {
		mkdirSync(join(workdir, "src"));
		writeFileSync(
			join(workdir, "src", "hooks.server.ts"),
			`export const handle = () => "hooked";\n`,
		);
		writeFileSync(join(workdir, "bosia.config.ts"), `export default { strictImports: false };\n`);
		const mod = await import(generateWorkersRuntime(workdir));
		expect(mod.handle()).toBe("hooked");
		expect(mod.config).toEqual({ strictImports: false });
	});

	test("no hooks, no config → null handle, empty config", async () => {
		const mod = await import(generateWorkersRuntime(workdir));
		expect(mod.handle).toBeNull();
		expect(mod.config).toEqual({});
	});
});

describe("workers runtime plugin", () => {
	test("keeps bare node builtins as real imports instead of browser stubs", async () => {
		const entry = join(workdir, "entry.ts");
		writeFileSync(entry, `import { existsSync } from "fs";\nexport const x = existsSync("/");\n`);
		const out = await Bun.build({
			entrypoints: [entry],
			target: "browser",
			plugins: [makeBosiaPlugin("bun", "workers")],
		}).then((r) => r.outputs[0].text());
		expect(out).toMatch(/from "(node:)?fs"/);
	});
});
