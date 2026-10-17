import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { mkdirSync, writeFileSync, rmSync } from "fs";
import { join } from "path";

import { getEphemeralPort } from "../src/core/prerender.ts";
import { BOSIA_NODE_PATH } from "../src/core/paths.ts";

// Boots a real built server with `websocket` exports in +server.ts routes and
// drives it over the wire: the hooks run before upgrade(), ws.data is what
// upgrade() returned, frames echo, refusals answer HTTP, shutdown sends 1001.

let tmpDir: string;
let child: Bun.Subprocess | null = null;
let port: number;
let origin: string;

function write(rel: string, body: string): void {
	const file = join(tmpDir, "src", rel);
	mkdirSync(join(file, ".."), { recursive: true });
	writeFileSync(file, body);
}

beforeAll(async () => {
	tmpDir = join(import.meta.dir, "..", `.tmp-websocket-${Date.now()}`);
	mkdirSync(join(tmpDir, "src", "routes"), { recursive: true });
	writeFileSync(join(tmpDir, "tsconfig.json"), JSON.stringify({ compilerOptions: { paths: {} } }));
	write("app.css", `@import "tailwindcss";\n@source "../src";\n`);
	write(
		"app.html",
		`<!doctype html>\n<html lang="%bosia.lang%">\n<head>%bosia.head%</head>\n<body>%bosia.body%</body>\n</html>\n`,
	);
	write("routes/+page.svelte", `<h1>Home</h1>\n`);

	// Auth like Rig (Authorization) or a browser (session cookie); a cookie set
	// before resolve() must ride on the 101.
	write(
		"hooks.server.ts",
		`export async function handle({ event, resolve }) {
	const auth = event.request.headers.get("authorization");
	if (auth === "Bearer rig-token") event.locals.user = "rig";
	else if (event.cookies.get("session") === "u1") event.locals.user = "u1";
	event.cookies.set("seen", "1", { path: "/" });
	// A hook may hand resolve() a new Request, or rebuild the Response it gets.
	if (event.url.searchParams.has("swap")) {
		const request = new Request(event.request, { headers: event.request.headers });
		return resolve({ ...event, request });
	}
	const res = await resolve(event);
	if (event.url.searchParams.has("rewrap")) return new Response(res.body, res);
	return res;
}
`,
	);

	write(
		"routes/ws/echo/+server.ts",
		`export const websocket = {
	upgrade({ locals }) {
		if (!locals.user) return new Response("no user", { status: 401 });
		return { user: locals.user };
	},
	message(ws, msg) {
		if (msg === "whoami") return ws.send(JSON.stringify(ws.data));
		if (msg === "bye") return ws.close(4403, "bye now");
		if (msg === "throw") throw new Error("boom");
		if (msg === "reject") return Promise.reject(new Error("async boom"));
		ws.send(msg);
	},
};
`,
	);

	write(
		"routes/ws/room/[id]/+server.ts",
		`export const websocket = {
	async upgrade({ params, locals }) {
		await new Promise((r) => setTimeout(r, 5));
		return { room: params.id, user: locals.user ?? null };
	},
	open(ws) {
		ws.send(JSON.stringify(ws.data));
	},
};
`,
	);

	write(
		"routes/ws/frozen/+server.ts",
		`const shared = Object.freeze({ kind: "frozen" });
export const websocket = {
	upgrade() {
		return shared;
	},
	open(ws) {
		ws.send(JSON.stringify({ data: ws.data, keys: Object.keys(ws.data) }));
	},
};
`,
	);

	write(
		"routes/ws/identity/+server.ts",
		`class Conn {
	n = 1;
}
const registry = new Set();
export const websocket = {
	upgrade() {
		const conn = new Conn();
		registry.add(conn);
		return conn;
	},
	open(ws) {
		ws.send(String(ws.data instanceof Conn && registry.has(ws.data)));
	},
};
`,
	);

	write(
		"routes/ws/err/+server.ts",
		`import { error, redirect } from "bosia";
export const websocket = {
	upgrade({ url }) {
		const k = url.searchParams.get("k");
		if (k === "403") error(403, "nope");
		if (k === "redirect") redirect(303, "/");
		throw new Error("boom");
	},
};
`,
	);

	write(
		"routes/ws/slow/+server.ts",
		`export const websocket = {
	async upgrade() {
		await new Promise((r) => setTimeout(r, 400));
		return {};
	},
};
`,
	);

	// A stream that never ends on its own, like an SSE feed.
	write(
		"routes/sse/+server.ts",
		`export function GET() {
	const body = new ReadableStream({
		start(c) {
			c.enqueue(new TextEncoder().encode("data: hi\\n\\n"));
		},
	});
	return new Response(body, { headers: { "content-type": "text/event-stream" } });
}
`,
	);

	write(
		"routes/ws/mixed/+server.ts",
		`export function GET() {
	return new Response("plain");
}
export const websocket = {
	message(ws, msg) {
		ws.send(msg);
	},
};
`,
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

	port = await getEphemeralPort();
	origin = `http://localhost:${port}`;
	child = Bun.spawn(["bun", "run", join(tmpDir, "dist", "server", "index.js")], {
		cwd: tmpDir,
		env: {
			...process.env,
			NODE_ENV: "production",
			PORT: String(port),
			NODE_PATH: BOSIA_NODE_PATH,
			CSRF_ALLOWED_ORIGINS: "http://ok.test",
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

afterAll(async () => {
	child?.kill();
	await child?.exited;
	rmSync(tmpDir, { recursive: true, force: true });
});

const RIG = { authorization: "Bearer rig-token" };

/** Raw handshake over TCP, so the status and headers of a 101 (or a refusal) can be read. */
function handshake(
	path: string,
	headers: Record<string, string> = {},
): Promise<{ status: number; head: string }> {
	return new Promise((resolve, reject) => {
		let buf = "";
		const extra = Object.entries(headers)
			.map(([k, v]) => `${k}: ${v}\r\n`)
			.join("");
		Bun.connect({
			hostname: "127.0.0.1",
			port,
			socket: {
				open(s) {
					s.write(
						`GET ${path} HTTP/1.1\r\nHost: localhost:${port}\r\nConnection: Upgrade\r\n` +
							`Upgrade: websocket\r\nSec-WebSocket-Version: 13\r\n` +
							`Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\n${extra}\r\n`,
					);
				},
				data(s, chunk) {
					buf += chunk.toString();
					const end = buf.indexOf("\r\n\r\n");
					if (end < 0) return;
					s.end();
					resolve({ status: Number(buf.split(" ")[1]), head: buf.slice(0, end) });
				},
				error(_s, err) {
					reject(err);
				},
				close() {
					if (!buf) reject(new Error("closed before a response"));
				},
			},
		}).catch(reject);
	});
}

function connect(path: string, headers: Record<string, string> = RIG): Promise<WebSocket> {
	return new Promise((resolve, reject) => {
		const ws = new WebSocket(`ws://localhost:${port}${path}`, { headers } as any);
		ws.binaryType = "arraybuffer";
		ws.onopen = () => resolve(ws);
		ws.onerror = () => reject(new Error(`could not connect to ${path}`));
	});
}

function nextMessage(ws: WebSocket): Promise<string | ArrayBuffer> {
	return new Promise((resolve) => {
		ws.addEventListener("message", (e) => resolve(e.data), { once: true });
	});
}

function closed(ws: WebSocket): Promise<{ code: number; reason: string }> {
	return new Promise((resolve) => {
		ws.addEventListener("close", (e) => resolve({ code: e.code, reason: e.reason }), {
			once: true,
		});
	});
}

describe("upgrade", () => {
	test("hooks run first: ws.data comes from upgrade() with locals", async () => {
		const ws = await connect("/ws/echo");
		ws.send("whoami");
		expect(JSON.parse((await nextMessage(ws)) as string)).toEqual({ user: "rig" });
		ws.close();
	});

	test("a session cookie authenticates a browser-style client", async () => {
		const ws = await connect("/ws/echo", { cookie: "session=u1" });
		ws.send("whoami");
		expect(JSON.parse((await nextMessage(ws)) as string)).toEqual({ user: "u1" });
		ws.close();
	});

	test("async upgrade() gets params", async () => {
		const ws = await connect("/ws/room/abc");
		expect(JSON.parse((await nextMessage(ws)) as string)).toEqual({ room: "abc", user: "rig" });
		ws.close();
	});

	test("a frozen object works and ws.data has only its fields", async () => {
		const ws = await connect("/ws/frozen");
		expect(JSON.parse((await nextMessage(ws)) as string)).toEqual({
			data: { kind: "frozen" },
			keys: ["kind"],
		});
		ws.close();
	});

	test("ws.data is the very object upgrade() returned", async () => {
		const ws = await connect("/ws/identity");
		expect(await nextMessage(ws)).toBe("true");
		ws.close();
	});

	test("the 101 carries cookies a hook set before resolve()", async () => {
		const { status, head } = await handshake("/ws/echo", RIG);
		expect(status).toBe(101);
		expect(head.toLowerCase()).toContain("set-cookie: seen=1");
	});

	test("upgrade() returning a Response refuses with it", async () => {
		expect((await handshake("/ws/echo")).status).toBe(401);
	});

	test("upgrade() throwing answers like an API handler", async () => {
		expect((await handshake("/ws/err?k=403")).status).toBe(403);
		expect((await handshake("/ws/err?k=redirect")).status).toBe(303);
		expect((await handshake("/ws/err")).status).toBe(500);
	});

	test("a plain GET to a websocket-only route gets 426", async () => {
		const res = await fetch(`${origin}/ws/echo`);
		expect(res.status).toBe(426);
		expect(res.headers.get("upgrade")).toBe("websocket");
	});

	test("HEAD gets 426 too; other methods get 405 with Allow: GET, HEAD", async () => {
		const head = await fetch(`${origin}/ws/echo`, { method: "HEAD" });
		expect(head.status).toBe(426);
		const post = await fetch(`${origin}/ws/echo`, { method: "POST", headers: { origin } });
		expect(post.status).toBe(405);
		expect(post.headers.get("allow")).toBe("GET, HEAD");
	});

	test("a hook that passes resolve() a new Request still upgrades", async () => {
		const ws = await connect("/ws/echo?swap");
		ws.send("whoami");
		expect(JSON.parse((await nextMessage(ws)) as string)).toEqual({ user: "rig" });
		ws.close();
	});

	test("a hook that rebuilds the Response still upgrades", async () => {
		const ws = await connect("/ws/echo?rewrap");
		ws.send("hi");
		expect(await nextMessage(ws)).toBe("hi");
		ws.close();
	});

	test("a route can export GET and websocket together", async () => {
		expect(await (await fetch(`${origin}/ws/mixed`)).text()).toBe("plain");
		const ws = await connect("/ws/mixed");
		ws.send("hi");
		expect(await nextMessage(ws)).toBe("hi");
		ws.close();
	});
});

describe("origin check", () => {
	test("same origin passes", async () => {
		expect((await handshake("/ws/echo", { ...RIG, origin })).status).toBe(101);
	});

	test("no Origin (a non-browser client like Rig) passes", async () => {
		expect((await handshake("/ws/echo", RIG)).status).toBe(101);
	});

	test("a cross-site Origin gets 403", async () => {
		expect((await handshake("/ws/echo", { ...RIG, origin: "http://evil.test" })).status).toBe(403);
	});

	test("CSRF_ALLOWED_ORIGINS is honoured", async () => {
		expect((await handshake("/ws/echo", { ...RIG, origin: "http://ok.test" })).status).toBe(101);
	});
});

describe("frames and close", () => {
	test("text and binary echo; binary bytes come back unchanged", async () => {
		const ws = await connect("/ws/echo");
		ws.send("hello");
		expect(await nextMessage(ws)).toBe("hello");
		const bytes = new Uint8Array([0, 255, 1, 2, 27, 91, 65]);
		ws.send(bytes);
		const back = await nextMessage(ws);
		expect(back).toBeInstanceOf(ArrayBuffer);
		expect([...new Uint8Array(back as ArrayBuffer)]).toEqual([...bytes]);
		ws.close();
	});

	test("an app close code and reason reach the client", async () => {
		const ws = await connect("/ws/echo");
		const done = closed(ws);
		ws.send("bye");
		expect(await done).toEqual({ code: 4403, reason: "bye now" });
	});

	test("a handler throw or rejection closes with 1011 and the server lives", async () => {
		for (const msg of ["throw", "reject"]) {
			const ws = await connect("/ws/echo");
			const done = closed(ws);
			ws.send(msg);
			expect((await done).code).toBe(1011);
		}
		expect((await fetch(`${origin}/_health`)).ok).toBe(true);
	});
});

// Last: it stops the server.
describe("shutdown", () => {
	test("SIGTERM: sockets close with 1001, a pending upgrade too, and the process exits 0", async () => {
		const ws = await connect("/ws/echo");
		const done = closed(ws);
		// Still inside its async upgrade() when the signal lands: it opens, so
		// the app sees open/close and can clean up, then gets 1001 at once.
		const pending = connect("/ws/slow").then(closed);
		// An open stream never finishes by itself; shutdown must not wait on it.
		const sse = await fetch(`${origin}/sse`);
		await sse.body!.getReader().read();
		await Bun.sleep(100);
		child!.kill("SIGTERM");
		expect((await done).code).toBe(1001);
		expect((await pending).code).toBe(1001);
		const t = Date.now();
		expect(await child!.exited).toBe(0);
		expect(Date.now() - t).toBeLessThan(1500);
	});
});
