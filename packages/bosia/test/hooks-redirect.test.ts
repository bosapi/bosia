import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { mkdirSync, writeFileSync, rmSync } from "fs";
import { join } from "path";

import { getEphemeralPort } from "../src/core/prerender.ts";
import { BOSIA_NODE_PATH } from "../src/core/paths.ts";

// A hook had no correct way to refuse a client-side navigation.
//
// The router fetches /__bosia/data/<route>.json instead of loading the page, and
// that URL was what `handle` saw — so the guard the docs teach
// (`event.url.pathname.startsWith("/admin")`) did not match, and the loaders ran
// for a visitor with no session. Guards that did match had only bad options: a
// raw 303 that `fetch` silently follows (the router then parses login HTML as
// JSON and invents a 500), or `throw redirect()`, which the outer catch turned
// into a real 500.
//
// Every assertion below is written against a *built, running* server. A unit
// test on resolve() would miss the whole point: the defect lived in the seam
// between handleRequest, the hook, and resolve().

let tmpDir: string;
let child: Bun.Subprocess | null = null;
let origin: string;

const dataUrl = (route: string) => `${origin}/__bosia/data${route}.json`;

beforeAll(async () => {
	tmpDir = join(import.meta.dir, "..", `.tmp-hooks-redirect-${Date.now()}`);
	const routes = join(tmpDir, "src", "routes");
	mkdirSync(routes, { recursive: true });

	writeFileSync(join(tmpDir, "tsconfig.json"), JSON.stringify({ compilerOptions: { paths: {} } }));
	writeFileSync(join(tmpDir, "src", "app.css"), `@import "tailwindcss";\n@source "../src";\n`);
	writeFileSync(
		join(tmpDir, "src", "app.html"),
		`<!doctype html>\n<html lang="%bosia.lang%">\n<head>%bosia.head%</head>\n<body>%bosia.body%</body>\n</html>\n`,
	);

	writeFileSync(join(routes, "+page.svelte"), `<h1>Beranda</h1>\n`);
	writeFileSync(join(routes, "+error.svelte"), `<h1>Galat</h1>\n`);

	// The protected route. `secret` is the sentinel: if it ever reaches an
	// unauthenticated caller, the guard did not run.
	mkdirSync(join(routes, "admin"), { recursive: true });
	writeFileSync(
		join(routes, "admin", "+page.svelte"),
		`<script>let { data } = $props();</script>\n<h1 data-secret={data.secret}>Panel</h1>\n`,
	);
	writeFileSync(
		join(routes, "admin", "+page.server.ts"),
		`export function load() {\n\treturn { secret: "leaked" };\n}\n`,
	);

	mkdirSync(join(routes, "login"), { recursive: true });
	writeFileSync(join(routes, "login", "+page.svelte"), `<h1>Masuk</h1>\n`);

	// The default branch is VERBATIM the guard docs/content/docs/guides/
	// middleware-hooks.md teaches. That matters: a guard that normalises the data
	// path back to /admin first is immune to the leak, and would let the security
	// test below pass against the unfixed build. This fixture has to be the app
	// the documentation produces, warts and all.
	//
	// The x-guard header picks a variant so one build covers every shape a hook
	// can refuse a request in.
	writeFileSync(
		join(tmpDir, "src", "hooks.server.ts"),
		`import { redirect, error, type Handle } from "bosia";\n\n` +
			`export const handle: Handle = async ({ event, resolve }) => {\n` +
			`\tconst mode = event.request.headers.get("x-guard");\n\n` +
			`\tif (mode === "echo") {\n` +
			`\t\treturn new Response("echo", {\n` +
			`\t\t\theaders: {\n` +
			`\t\t\t\t"x-seen-path": event.url.pathname,\n` +
			`\t\t\t\t"x-is-data": String(event.isDataRequest),\n` +
			`\t\t\t},\n` +
			`\t\t});\n` +
			`\t}\n\n` +
			`\tif (mode === "fabricate") {\n` +
			`\t\treturn resolve({ ...event, request: new Request(event.request.url) });\n` +
			`\t}\n\n` +
			`\tif (mode === "throw-redirect") throw redirect(303, "/login");\n\n` +
			`\tif (mode === "throw-redirect-cookie") {\n` +
			`\t\tevent.cookies.delete("sid", { path: "/" });\n` +
			`\t\tthrow redirect(303, "/login");\n` +
			`\t}\n\n` +
			`\tif (mode === "throw-error") throw error(404, "Tidak ditemukan");\n\n` +
			`\tif (mode === "raw-redirect-cookie") {\n` +
			`\t\treturn new Response(null, {\n` +
			`\t\t\tstatus: 303,\n` +
			`\t\t\theaders: { Location: "/login", "Set-Cookie": "sid=; Path=/; Max-Age=0" },\n` +
			`\t\t});\n` +
			`\t}\n\n` +
			`\tif (event.url.pathname.startsWith("/admin") && !event.locals.user) {\n` +
			`\t\treturn Response.redirect("/login", 303);\n` +
			`\t}\n` +
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

describe("a guard runs on client navigations too", () => {
	// The one that must never go green by accident. Before the fix the guard
	// never matched this URL and the response was the full loader payload.
	test("the data endpoint does not hand loader data to an unauthenticated caller", async () => {
		const res = await fetch(dataUrl("/admin"));
		const body = await res.text();
		expect(body).not.toContain("leaked");
		expect(body).not.toContain("pageData");
	});

	test("the page URL is guarded the same way — the path that always worked", async () => {
		const res = await fetch(`${origin}/admin`, { redirect: "manual" });
		expect(res.status).toBe(303);
		expect(res.headers.get("location")).toBe("/login");
	});

	test("event.url is the page URL, not the /__bosia/data transport path", async () => {
		const res = await fetch(dataUrl("/admin"), { headers: { "x-guard": "echo" } });
		expect(res.headers.get("x-seen-path")).toBe("/admin");
	});

	test("event.isDataRequest tells the two request kinds apart", async () => {
		const asData = await fetch(dataUrl("/admin"), { headers: { "x-guard": "echo" } });
		expect(asData.headers.get("x-is-data")).toBe("true");

		const asPage = await fetch(`${origin}/admin`, { headers: { "x-guard": "echo" } });
		expect(asPage.headers.get("x-is-data")).toBe("false");
	});
});

describe("a hook can redirect a data request", () => {
	// `fetch` follows a raw 303, so the router used to receive the login page's
	// HTML at status 200, fail to parse it, and render "500 Internal Server Error".
	test("a returned Response.redirect becomes the router's JSON redirect", async () => {
		const res = await fetch(dataUrl("/admin"));
		expect(res.status).toBe(200);
		expect(res.headers.get("content-type")).toContain("application/json");
		expect(await res.json()).toMatchObject({ redirect: "/login", status: 303 });
	});

	test("a thrown redirect() produces the identical payload", async () => {
		const res = await fetch(dataUrl("/admin"), { headers: { "x-guard": "throw-redirect" } });
		expect(res.status).toBe(200);
		expect(await res.json()).toMatchObject({ redirect: "/login", status: 303 });
	});

	test("a thrown redirect() on a page request is a real 303, not a 500", async () => {
		const res = await fetch(`${origin}/admin`, {
			headers: { "x-guard": "throw-redirect" },
			redirect: "manual",
		});
		expect(res.status).toBe(303);
		expect(res.headers.get("location")).toBe("/login");
	});

	test("Set-Cookie from a returned redirect survives the JSON conversion", async () => {
		const res = await fetch(dataUrl("/admin"), { headers: { "x-guard": "raw-redirect-cookie" } });
		expect(await res.json()).toMatchObject({ redirect: "/login" });
		// Signing someone out on the way to /login must not be dropped in transit.
		expect(res.headers.get("set-cookie")).toContain("sid=");
	});

	test("cookies set before a thrown redirect survive too", async () => {
		const res = await fetch(dataUrl("/admin"), {
			headers: { "x-guard": "throw-redirect-cookie" },
		});
		expect(await res.json()).toMatchObject({ redirect: "/login" });
		expect(res.headers.get("set-cookie")).toContain("sid=");
	});
});

describe("a hook can refuse with an error", () => {
	test("a thrown error() reaches the router as JSON with its own status", async () => {
		const res = await fetch(dataUrl("/admin"), { headers: { "x-guard": "throw-error" } });
		expect(res.status).toBe(404);
		expect(res.headers.get("content-type")).toContain("application/json");
		expect(await res.json()).toMatchObject({
			error: { status: 404, message: "Tidak ditemukan" },
		});
	});

	test("the same throw renders an error page on a page request", async () => {
		const res = await fetch(`${origin}/admin`, { headers: { "x-guard": "throw-error" } });
		expect(res.status).toBe(404);
		expect(res.headers.get("content-type")).toContain("text/html");
	});
});

describe("the data endpoint's own contract", () => {
	test("a path that escapes the origin is still rejected, now before the hooks", async () => {
		const res = await fetch(`${origin}/__bosia/data//evil.com/x.json`);
		expect(res.status).toBe(400);
		expect(await res.json()).toMatchObject({ error: "Invalid path" });
	});

	// Pins the documented limit of the WeakMap in server.ts: the parse is keyed on
	// the incoming Request, so a hook that hands resolve() a fabricated one
	// detaches the event from it. Not silent breakage — page HTML, which the
	// client router's reader turns into an error rather than a mis-parse. If a
	// future marker makes this work, this test is what says so.
	test("resolve() with a fabricated Request falls back to rendering the page", async () => {
		const res = await fetch(dataUrl("/admin"), { headers: { "x-guard": "fabricate" } });
		expect(res.status).toBe(200);
		expect(res.headers.get("content-type")).toContain("text/html");
	});
});
