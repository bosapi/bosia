import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { mkdirSync, writeFileSync, rmSync } from "fs";
import { join } from "path";

import { getEphemeralPort } from "../src/core/prerender.ts";
import { BOSIA_NODE_PATH } from "../src/core/paths.ts";

// A layout guard — `(private)/+layout.server.ts` redirecting anonymous visitors,
// as the store template and the auth-flow skill both teach — has to hold for
// every way a request can reach the code under it.
//
// It did not. The data endpoint took `?_invalidated=` from the client and
// skipped any layout whose bit was '0', so `/__bosia/data/dashboard.json?
// _invalidated=1000` ran the page loader with no session. The same endpoint fed
// a client-sent `parentSnapshots` body into `parent()`, and form actions ran
// without any layout loader at all.
//
// Written against a built, running server: the bypass lived in the seam between
// the client-controlled mask and loadRouteData.

let tmpDir: string;
let child: Bun.Subprocess | null = null;
let origin: string;

const dataUrl = (route: string, bits?: string) =>
	`${origin}/__bosia/data${route}.json${bits ? `?_invalidated=${bits}` : ""}`;
const signedIn = { cookie: "sid=ok" };

beforeAll(async () => {
	tmpDir = join(import.meta.dir, "..", `.tmp-layout-guard-${Date.now()}`);
	const routes = join(tmpDir, "src", "routes");
	const priv = join(routes, "(private)");
	const dash = join(priv, "dashboard");
	mkdirSync(dash, { recursive: true });

	writeFileSync(join(tmpDir, "tsconfig.json"), JSON.stringify({ compilerOptions: { paths: {} } }));
	writeFileSync(join(tmpDir, "src", "app.css"), `@import "tailwindcss";\n@source "../src";\n`);
	writeFileSync(
		join(tmpDir, "src", "app.html"),
		`<!doctype html>\n<html lang="%bosia.lang%">\n<head>%bosia.head%</head>\n<body>%bosia.body%</body>\n</html>\n`,
	);
	writeFileSync(join(routes, "+page.svelte"), `<h1>Beranda</h1>\n`);
	writeFileSync(join(routes, "+error.svelte"), `<h1>Galat</h1>\n`);

	writeFileSync(
		join(tmpDir, "src", "hooks.server.ts"),
		`import type { Handle } from "bosia";\n\n` +
			`export const handle: Handle = async ({ event, resolve }) => {\n` +
			`\tif (event.cookies.get("sid") === "ok") event.locals.user = { id: 1, role: "member" };\n` +
			`\treturn resolve(event);\n` +
			`};\n`,
	);

	writeFileSync(
		join(priv, "+layout.svelte"),
		`<script>let { children } = $props();</script>\n{@render children()}\n`,
	);
	writeFileSync(
		join(priv, "+layout.server.ts"),
		`import { redirect } from "bosia";\n\n` +
			`export function load({ locals }: any) {\n` +
			`\tif (!locals.user) throw redirect(303, "/login");\n` +
			`\treturn { user: locals.user };\n` +
			`}\n`,
	);

	// `secret` and `action-ran` are the sentinels: either reaching an anonymous
	// caller means the guard did not run.
	writeFileSync(
		join(dash, "+page.svelte"),
		`<script>let { data } = $props();</script>\n<h1>{data.role}</h1>\n`,
	);
	writeFileSync(
		join(dash, "+page.server.ts"),
		`export async function load({ parent }: any) {\n` +
			`\tconst { user } = await parent();\n` +
			`\treturn { secret: "leaked", role: user.role };\n` +
			`}\n\n` +
			`export const actions = {\n` +
			`\tdefault: async () => ({ done: "action-ran" }),\n` +
			`};\n`,
	);

	mkdirSync(join(routes, "login"), { recursive: true });
	writeFileSync(join(routes, "login", "+page.svelte"), `<h1>Masuk</h1>\n`);

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

	const port = await getEphemeralPort();
	origin = `http://localhost:${port}`;
	child = Bun.spawn(["bun", "run", join(tmpDir, "dist", "server", "index.js")], {
		cwd: tmpDir,
		env: {
			...process.env,
			NODE_ENV: "production",
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

describe("the client cannot switch a layout guard off", () => {
	test("a '0' layout bit still runs the guard", async () => {
		const res = await fetch(dataUrl("/dashboard", "1000"));
		const body = await res.text();
		expect(body).not.toContain("leaked");
		expect(JSON.parse(body)).toMatchObject({ redirect: "/login", status: 303 });
	});

	test("an all-zero mask still runs the guard", async () => {
		const res = await fetch(dataUrl("/dashboard", "0000"));
		expect(await res.text()).not.toContain("leaked");
	});

	test("a signed-in visitor gets the omitted layer as null and the page data", async () => {
		const res = await fetch(dataUrl("/dashboard", "10"), { headers: signedIn });
		const body = await res.json();
		expect(body.layoutData[0]).toBeNull();
		expect(body.pageData).toMatchObject({ secret: "leaked", role: "member" });
	});
});

describe("parent() data comes from the server only", () => {
	test("a forged parentSnapshots body is ignored", async () => {
		const res = await fetch(dataUrl("/dashboard", "10"), {
			method: "POST",
			headers: { ...signedIn, origin, "content-type": "application/json" },
			body: JSON.stringify({ parentSnapshots: { 0: { user: { id: 1, role: "admin" } } } }),
		});
		const body = await res.json();
		expect(body.pageData.role).toBe("member");
	});

	test("a forged body cannot stand in for an anonymous visitor's session", async () => {
		const res = await fetch(dataUrl("/dashboard", "10"), {
			method: "POST",
			headers: { origin, "content-type": "application/json" },
			body: JSON.stringify({ parentSnapshots: { 0: { user: { id: 1, role: "admin" } } } }),
		});
		const body = await res.text();
		expect(body).not.toContain("leaked");
		expect(body).not.toContain("admin");
	});
});

describe("form actions run behind the layout guard", () => {
	test("an enhanced action from an anonymous visitor gets the guard's redirect", async () => {
		const res = await fetch(`${origin}/dashboard`, {
			method: "POST",
			headers: { origin, "x-bosia-action": "1" },
			body: new FormData(),
		});
		const body = await res.text();
		expect(body).not.toContain("action-ran");
		expect(JSON.parse(body)).toMatchObject({ type: "redirect", location: "/login" });
	});

	test("a plain form POST from an anonymous visitor is a 303 to the login page", async () => {
		const res = await fetch(`${origin}/dashboard`, {
			method: "POST",
			headers: { origin },
			body: new FormData(),
			redirect: "manual",
		});
		expect(res.status).toBe(303);
		expect(res.headers.get("location")).toBe("/login");
	});

	test("a signed-in visitor's action still runs", async () => {
		const res = await fetch(`${origin}/dashboard`, {
			method: "POST",
			headers: { ...signedIn, origin, "x-bosia-action": "1" },
			body: new FormData(),
		});
		expect(await res.json()).toMatchObject({ type: "success", data: { done: "action-ran" } });
	});
});
