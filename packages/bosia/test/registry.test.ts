import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { mergePkgJson, resolveLocalRegistry } from "../src/cli/registry.ts";

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
