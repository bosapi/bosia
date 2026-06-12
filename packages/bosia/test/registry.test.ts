import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import {
	mergePkgJson,
	readRegistryJSON,
	resolveLocalRegistry,
	writeRegistryFile,
} from "../src/cli/registry.ts";
import { routeAdd, type AddRunners } from "../src/cli/addRouter.ts";

let tmpDir: string;

beforeEach(() => {
	tmpDir = mkdtempSync(join(tmpdir(), "bosia-registry-"));
});

afterEach(() => {
	rmSync(tmpDir, { recursive: true, force: true });
});

function writePkg(pkg: any) {
	writeFileSync(join(tmpDir, "package.json"), JSON.stringify(pkg, null, 2));
}

function readPkg(): any {
	return JSON.parse(readFileSync(join(tmpDir, "package.json"), "utf-8"));
}

describe("mergePkgJson() — deps", () => {
	test("returns empty arrays when package.json missing", () => {
		const out = mergePkgJson(tmpDir, { deps: { foo: "1.0.0" } });
		expect(out).toEqual({ addedDeps: [], addedScripts: [] });
	});

	test("adds new deps and reports them", () => {
		writePkg({ name: "x" });
		const out = mergePkgJson(tmpDir, { deps: { foo: "^1.0.0" } });
		expect(out.addedDeps).toEqual(["foo"]);
		expect(readPkg().dependencies).toEqual({ foo: "^1.0.0" });
	});

	test("does not overwrite existing deps", () => {
		writePkg({ name: "x", dependencies: { foo: "1.0.0" } });
		const out = mergePkgJson(tmpDir, { deps: { foo: "2.0.0" } });
		expect(out.addedDeps).toEqual([]);
		expect(readPkg().dependencies.foo).toBe("1.0.0");
	});

	test("adds devDeps separately", () => {
		writePkg({ name: "x" });
		const out = mergePkgJson(tmpDir, { devDeps: { vitest: "^1" } });
		expect(out.addedDeps).toEqual(["vitest"]);
		expect(readPkg().devDependencies).toEqual({ vitest: "^1" });
	});

	test("adds scripts and reports them", () => {
		writePkg({ name: "x" });
		const out = mergePkgJson(tmpDir, { scripts: { build: "bosia build" } });
		expect(out.addedScripts).toEqual(["build"]);
		expect(readPkg().scripts).toEqual({ build: "bosia build" });
	});

	test("preserves existing script when key already present", () => {
		writePkg({ name: "x", scripts: { build: "old" } });
		const out = mergePkgJson(tmpDir, { scripts: { build: "new" } });
		expect(out.addedScripts).toEqual([]);
		expect(readPkg().scripts.build).toBe("old");
	});

	test("merges deps + devDeps + scripts in one call", () => {
		writePkg({ name: "x" });
		const out = mergePkgJson(tmpDir, {
			deps: { a: "1" },
			devDeps: { b: "2" },
			scripts: { dev: "bosia dev" },
		});
		expect(out.addedDeps.sort()).toEqual(["a", "b"]);
		expect(out.addedScripts).toEqual(["dev"]);
		const pkg = readPkg();
		expect(pkg.dependencies).toEqual({ a: "1" });
		expect(pkg.devDependencies).toEqual({ b: "2" });
		expect(pkg.scripts).toEqual({ dev: "bosia dev" });
	});

	test("does not write file when nothing changed", () => {
		writePkg({ name: "x", dependencies: { foo: "1" } });
		const before = readFileSync(join(tmpDir, "package.json"), "utf-8");
		mergePkgJson(tmpDir, { deps: { foo: "2" } });
		const after = readFileSync(join(tmpDir, "package.json"), "utf-8");
		expect(after).toBe(before);
	});
});

describe("resolveLocalRegistry()", () => {
	test("walks up to find registry/index.json in this monorepo", () => {
		// This test runs inside the bosia repo, where registry/index.json exists at root.
		const out = resolveLocalRegistry();
		expect(out.endsWith("/registry")).toBe(true);
	});
});

describe("readRegistryJSON() — local path construction", () => {
	test("blocks category resolves to <root>/blocks/<cat>/<name>/<file>", async () => {
		const root = join(tmpDir, "registry");
		const blockDir = join(root, "blocks", "cards", "feature");
		mkdirSync(blockDir, { recursive: true });
		writeFileSync(join(blockDir, "meta.json"), JSON.stringify({ name: "cards/feature" }));

		const meta = await readRegistryJSON<{ name: string }>(
			root,
			"blocks",
			"cards/feature",
			"meta.json",
		);
		expect(meta.name).toBe("cards/feature");
	});
});

describe("writeRegistryFile()", () => {
	test("writes when destination is fresh", () => {
		const dest = join(tmpDir, "fresh.txt");
		writeRegistryFile(dest, "hello");
		expect(readFileSync(dest, "utf-8")).toBe("hello");
	});

	test("overwrites an existing writable file", () => {
		const dest = join(tmpDir, "again.txt");
		writeFileSync(dest, "old");
		writeRegistryFile(dest, "new");
		expect(readFileSync(dest, "utf-8")).toBe("new");
	});
});

describe("routeAdd() — dispatch", () => {
	type Call = { name: string; args: unknown[] };
	function makeRunners(): { runners: AddRunners; calls: Call[] } {
		const calls: Call[] = [];
		const runners: AddRunners = {
			runAdd: (names, flags) => {
				calls.push({ name: "runAdd", args: [names, flags] });
			},
			runAddBlock: (name, flags) => {
				calls.push({ name: "runAddBlock", args: [name, flags] });
			},
			runAddPage: (name, flags) => {
				calls.push({ name: "runAddPage", args: [name, flags] });
			},
			runAddTheme: (name, flags) => {
				calls.push({ name: "runAddTheme", args: [name, flags] });
			},
			runAddFont: (family, url) => {
				calls.push({ name: "runAddFont", args: [family, url] });
			},
			runAddList: () => {
				calls.push({ name: "runAddList", args: [] });
			},
		};
		return { runners, calls };
	}

	test("`add block cards/feature` → runAddBlock", async () => {
		const { runners, calls } = makeRunners();
		await routeAdd(["block", "cards/feature"], runners);
		expect(calls).toEqual([{ name: "runAddBlock", args: ["cards/feature", []] }]);
	});

	test("`add blocks/cards/feature` alias → runAddBlock", async () => {
		const { runners, calls } = makeRunners();
		await routeAdd(["blocks/cards/feature"], runners);
		expect(calls).toEqual([{ name: "runAddBlock", args: ["cards/feature", []] }]);
	});

	test("mixed batch splits into runAdd + per-block runAddBlock", async () => {
		const { runners, calls } = makeRunners();
		await routeAdd(["ui/button", "blocks/cards/x", "ui/badge"], runners);
		expect(calls).toEqual([
			{ name: "runAdd", args: [["ui/button", "ui/badge"], []] },
			{ name: "runAddBlock", args: ["cards/x", []] },
		]);
	});

	test("multiple `blocks/...` tokens install one at a time", async () => {
		const { runners, calls } = makeRunners();
		await routeAdd(["blocks/cards/a", "blocks/cards/b"], runners);
		expect(calls).toEqual([
			{ name: "runAddBlock", args: ["cards/a", []] },
			{ name: "runAddBlock", args: ["cards/b", []] },
		]);
	});

	test("plain components fall through to runAdd unchanged", async () => {
		const { runners, calls } = makeRunners();
		await routeAdd(["ui/button", "ui/card", "-y"], runners);
		expect(calls).toEqual([{ name: "runAdd", args: [["ui/button", "ui/card"], ["-y"]] }]);
	});

	test("`add page storefront/home` → runAddPage", async () => {
		const { runners, calls } = makeRunners();
		await routeAdd(["page", "storefront/home"], runners);
		expect(calls).toEqual([{ name: "runAddPage", args: ["storefront/home", []] }]);
	});

	test("`add pages/storefront/home` alias → runAddPage", async () => {
		const { runners, calls } = makeRunners();
		await routeAdd(["pages/storefront/home"], runners);
		expect(calls).toEqual([{ name: "runAddPage", args: ["storefront/home", []] }]);
	});

	test("mixed batch splits blocks, pages, and components", async () => {
		const { runners, calls } = makeRunners();
		await routeAdd(["ui/button", "blocks/cards/x", "pages/storefront/home"], runners);
		expect(calls).toEqual([
			{ name: "runAdd", args: [["ui/button"], []] },
			{ name: "runAddBlock", args: ["cards/x", []] },
			{ name: "runAddPage", args: ["storefront/home", []] },
		]);
	});
});
