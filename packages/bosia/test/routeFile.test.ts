import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { generateRoutesFile } from "../src/core/routeFile.ts";
import type { RouteManifest } from "../src/core/types.ts";

let originalCwd: string;
let tmpDir: string;

beforeEach(() => {
	originalCwd = process.cwd();
	tmpDir = mkdtempSync(join(tmpdir(), "bosia-routefile-"));
	process.chdir(tmpDir);
	mkdirSync(join(tmpDir, "src", "routes", "blog"), { recursive: true });
	writeFileSync(join(tmpDir, "src", "routes", "blog", "+page.ts"), "export default 'page';\n");
	writeFileSync(join(tmpDir, "src", "routes", "+layout.ts"), "export default 'layout';\n");
	writeFileSync(join(tmpDir, "src", "routes", "+server.ts"), "export const GET = () => 1;\n");
});

afterEach(() => {
	process.chdir(originalCwd);
	rmSync(tmpDir, { recursive: true, force: true });
});

const manifest = (pageServer: string | null): RouteManifest => ({
	pages: [
		{
			pattern: "/blog",
			page: "blog/+page.ts",
			layouts: ["+layout.ts"],
			pageServer,
			layoutServers: [],
			errorPages: [],
			trailingSlash: "never",
		} as any,
	],
	apis: [{ pattern: "/", server: "+server.ts" }],
	errorPage: null,
});

describe("generateRoutesFile() — server import thunks", () => {
	test("each server thunk imports once and returns the same promise", async () => {
		generateRoutesFile(manifest(null));
		const { serverRoutes, apiRoutes } = await import(join(tmpDir, ".bosia", "routes.ts"));
		const route = serverRoutes[0];

		const first = route.pageModule();
		expect(route.pageModule()).toBe(first);
		expect((await first).default).toBe("page");
		expect(route.layoutModules[0]()).toBe(route.layoutModules[0]());
		expect(apiRoutes[0].module()).toBe(apiRoutes[0].module());
	});

	test("a failed import is retried on the next call", async () => {
		generateRoutesFile(manifest("blog/+page.server.ts"));
		const { serverRoutes } = await import(join(tmpDir, ".bosia", "routes.ts") + "?retry");
		const route = serverRoutes[0];

		await expect(route.pageServer()).rejects.toThrow();
		writeFileSync(
			join(tmpDir, "src", "routes", "blog", "+page.server.ts"),
			"export const load = () => ({});\n",
		);
		const mod = await route.pageServer();
		expect(typeof mod.load).toBe("function");
	});

	test("client routes keep plain import thunks", () => {
		generateRoutesFile(manifest(null));
		const client = readFileSync(join(tmpDir, ".bosia", "routes.client.ts"), "utf-8");
		expect(client).not.toContain("once(");
		expect(client).toContain('page: () => import("../src/routes/blog/+page.ts")');
	});
});
