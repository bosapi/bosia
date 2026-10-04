import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { mkdirSync, writeFileSync, rmSync } from "fs";
import { join } from "path";

import { getEphemeralPort } from "../src/core/prerender.ts";
import { BOSIA_NODE_PATH } from "../src/core/paths.ts";

// In dev the static fallthrough looks files up under dist/ per request, where
// `bosia build` also leaves the user's bundled `src/hooks.server.ts` and the
// server bundle. Production refuses them through its boot-time manifest; this
// pins the dev path, which is wired separately in server.ts. The built server
// runs with NODE_ENV=development, which is what selects that path.

let tmpDir: string;
let child: Bun.Subprocess | null = null;
let origin: string;

beforeAll(async () => {
	tmpDir = join(import.meta.dir, "..", `.tmp-dev-static-${Date.now()}`);
	const routes = join(tmpDir, "src", "routes");
	mkdirSync(routes, { recursive: true });

	writeFileSync(join(tmpDir, "tsconfig.json"), JSON.stringify({ compilerOptions: { paths: {} } }));
	writeFileSync(join(tmpDir, "src", "app.css"), `@import "tailwindcss";\n@source "../src";\n`);
	writeFileSync(
		join(tmpDir, "src", "app.html"),
		`<!doctype html>\n<html lang="%bosia.lang%">\n<head>%bosia.head%</head>\n<body>%bosia.body%</body>\n</html>\n`,
	);
	writeFileSync(join(routes, "+page.svelte"), `<h1>Beranda</h1>\n`);
	// The sentinel: if it reaches a browser, the bundled hooks were served.
	writeFileSync(
		join(tmpDir, "src", "hooks.server.ts"),
		`const API_KEY = "sk-live-SENTINEL";\n` +
			`export const handle = async ({ event, resolve }: any) => {\n` +
			`\tevent.locals.key = API_KEY;\n` +
			`\treturn resolve(event);\n` +
			`};\n`,
	);

	const build = Bun.spawn(["bun", "run", join(import.meta.dir, "..", "src", "core", "build.ts")], {
		cwd: tmpDir,
		env: { ...process.env, NODE_ENV: "production", NODE_PATH: BOSIA_NODE_PATH },
		stdout: "pipe",
		stderr: "pipe",
	});
	const [code, out, err] = await Promise.all([
		build.exited,
		new Response(build.stdout).text(),
		new Response(build.stderr).text(),
	]);
	if (code !== 0) throw new Error(`build failed (${code})\n${out}\n${err}`);

	// A user file at the dist root, which dev must keep serving.
	writeFileSync(join(tmpDir, "dist", "robots.txt"), "User-agent: *");

	const port = await getEphemeralPort();
	origin = `http://localhost:${port}`;
	child = Bun.spawn(["bun", "run", join(tmpDir, "dist", "server", "index.js")], {
		cwd: tmpDir,
		env: {
			...process.env,
			NODE_ENV: "development",
			PORT: String(port),
			NODE_PATH: BOSIA_NODE_PATH,
		},
		stdout: "ignore",
		stderr: "ignore",
	});

	const deadline = Date.now() + 15_000;
	while (Date.now() < deadline) {
		try {
			if ((await fetch(`${origin}/_health`)).ok) return;
		} catch {
			/* not up yet */
		}
		await Bun.sleep(50);
	}
	throw new Error("server never became ready");
}, 180_000);

afterAll(() => {
	child?.kill();
	rmSync(tmpDir, { recursive: true, force: true });
});

describe("the dev static fallthrough", () => {
	test("does not serve the bundled hooks", async () => {
		const res = await fetch(`${origin}/hooks.server.js`);
		expect(res.status).toBe(404);
		expect(await res.text()).not.toContain("SENTINEL");
	});

	test("does not serve the server bundle or build metadata", async () => {
		for (const p of ["/server/index.js", "/SERVER/index.js", "/route-manifest.json"]) {
			const res = await fetch(`${origin}${p}`);
			expect(res.status).toBe(404);
		}
	});

	test("still serves a user file at the dist root", async () => {
		const res = await fetch(`${origin}/robots.txt`);
		expect(res.status).toBe(200);
		expect(await res.text()).toBe("User-agent: *");
	});
});
