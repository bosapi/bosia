import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { readArtifact } from "../src/core/artifacts.ts";
import { generateArtifactsModule } from "../src/core/artifactCodegen.ts";
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
