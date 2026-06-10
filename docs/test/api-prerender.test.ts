import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";

const STATIC_API = join(import.meta.dir, "..", "dist", "static", "api");

async function walkJson(dir: string): Promise<string[]> {
	const out: string[] = [];
	for (const entry of await readdir(dir)) {
		const full = join(dir, entry);
		const st = await stat(full);
		if (st.isDirectory()) out.push(...(await walkJson(full)));
		else if (entry.endsWith(".json")) out.push(full);
	}
	return out;
}

describe("prerendered /api/**/*.json artifacts", () => {
	if (!existsSync(STATIC_API)) {
		test.skip("requires prior `bun run build` to produce dist/static/api/**", () => {});
		return;
	}

	test("every .json file under dist/static/api parses as JSON", async () => {
		const files = await walkJson(STATIC_API);
		expect(files.length).toBeGreaterThan(0);
		for (const file of files) {
			const text = await readFile(file, "utf-8");
			try {
				JSON.parse(text);
			} catch (err) {
				throw new Error(
					`${relative(STATIC_API, file)} is not valid JSON — first 80 bytes: ${JSON.stringify(text.slice(0, 80))}`,
				);
			}
		}
	});

	test("list endpoints have expected top-level shape", async () => {
		const expectations: Array<[string, (j: any) => boolean, string]> = [
			["skills.json", (j) => Array.isArray(j.skills), "expected { skills: [...] }"],
			["components.json", (j) => Array.isArray(j.components), "expected { components: [...] }"],
			["blocks.json", (j) => Array.isArray(j.blocks), "expected { blocks: [...] }"],
		];
		for (const [name, check, hint] of expectations) {
			const file = join(STATIC_API, name);
			if (!existsSync(file)) continue;
			const j = JSON.parse(await readFile(file, "utf-8"));
			if (!check(j)) throw new Error(`${name}: ${hint}, got ${JSON.stringify(j).slice(0, 80)}`);
		}
	});

	test("list endpoint items expose `path` as full /api/<kind>/<...>.json URL", async () => {
		const cases: Array<[string, string, string]> = [
			["skills.json", "skills", "/api/skills/"],
			["components.json", "components", "/api/components/"],
			["blocks.json", "blocks", "/api/blocks/"],
		];
		for (const [file, key, prefix] of cases) {
			const full = join(STATIC_API, file);
			if (!existsSync(full)) continue;
			const j = JSON.parse(await readFile(full, "utf-8"));
			const items: any[] = j[key];
			expect(Array.isArray(items)).toBe(true);
			for (const item of items) {
				expect(typeof item.path).toBe("string");
				if (!item.path.startsWith(prefix) || !item.path.endsWith(".json")) {
					throw new Error(
						`${file}: item path ${JSON.stringify(item.path)} must start with ${prefix} and end with .json`,
					);
				}
				const rel = item.path.slice("/api/".length);
				const onDisk = join(STATIC_API, rel);
				if (!existsSync(onDisk)) {
					throw new Error(`${file}: path ${item.path} does not resolve to a file on disk`);
				}
			}
		}
	});

	test("skills/<name>.json detail returns { name, content } (not raw markdown)", async () => {
		const skillsDir = join(STATIC_API, "skills");
		if (!existsSync(skillsDir)) return;
		const files = (await readdir(skillsDir)).filter((f) => f.endsWith(".json"));
		expect(files.length).toBeGreaterThan(0);
		for (const f of files) {
			const text = await readFile(join(skillsDir, f), "utf-8");
			// Catches the v0.5.3 bug where raw `---\nname: ...` markdown landed in
			// the .json file.
			expect(text.startsWith("---")).toBe(false);
			const j = JSON.parse(text);
			expect(typeof j.name).toBe("string");
			expect(typeof j.content).toBe("string");
			expect(j.path).toMatch(/^\/api\/skills\/.+\.json$/);
			expect(j.path).toBe(`/api/skills/${j.name}.json`);
		}
	});

	test("components/<...>.json detail has { name, content, path: /api/components/<...>.json }", async () => {
		const compRoot = join(STATIC_API, "components");
		if (!existsSync(compRoot)) return;
		const files = (await walkJson(compRoot)).filter(
			(f) => relative(compRoot, f) !== "" && !f.endsWith("/index.json"),
		);
		for (const file of files) {
			const j = JSON.parse(await readFile(file, "utf-8"));
			if (Array.isArray(j.components)) continue; // list endpoint variant — skip
			expect(typeof j.name).toBe("string");
			expect(typeof j.content).toBe("string");
			expect(j.path).toMatch(/^\/api\/components\/.+\.json$/);
			const rel = "components/" + relative(compRoot, file);
			expect(j.path).toBe("/api/" + rel);
		}
	});

	test("blocks/<...>.json detail has { name, content, path: /api/blocks/<...>.json }", async () => {
		const blockRoot = join(STATIC_API, "blocks");
		if (!existsSync(blockRoot)) return;
		const files = await walkJson(blockRoot);
		for (const file of files) {
			const j = JSON.parse(await readFile(file, "utf-8"));
			if (Array.isArray(j.blocks)) continue;
			expect(typeof j.name).toBe("string");
			expect(typeof j.content).toBe("string");
			expect(j.path).toMatch(/^\/api\/blocks\/.+\.json$/);
			const rel = "blocks/" + relative(blockRoot, file);
			expect(j.path).toBe("/api/" + rel);
		}
	});
});
