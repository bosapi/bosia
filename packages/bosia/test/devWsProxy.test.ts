import { describe, test, expect, beforeAll, afterAll } from "bun:test";

import {
	closeProxiedSockets,
	proxyHandlers,
	proxyUpgrade,
	toSendableCode,
} from "../src/core/devWsProxy.ts";

// The dev proxy's WebSocket leg, between a stand-in app server and a client:
// the app is reached first, frames and close codes go through, a refusal is a
// failed handshake, and a rebuild sends 1012.

let app: ReturnType<typeof Bun.serve>;
let proxy: ReturnType<typeof Bun.serve>;
const seenByApp: Record<string, string | null>[] = [];
const appCloses: number[] = [];
const appSockets: Record<string, { open: number; closed: number }> = {};
const count = (path: string) => (appSockets[path] ??= { open: 0, closed: 0 });

beforeAll(() => {
	app = Bun.serve({
		port: 0,
		async fetch(req, server) {
			const url = new URL(req.url);
			if (url.pathname === "/slow") await Bun.sleep(300);
			seenByApp.push({
				authorization: req.headers.get("authorization"),
				origin: req.headers.get("origin"),
				protocol: req.headers.get("sec-websocket-protocol"),
			});
			if (url.pathname === "/refuse") return new Response(null, { status: 401 });
			const offered = req.headers.get("sec-websocket-protocol");
			const ok = server.upgrade(req, {
				data: { path: url.pathname },
				// The fixture picks the first offered protocol by hand.
				headers: new Headers(
					offered ? { "Sec-WebSocket-Protocol": offered.split(",")[0]!.trim() } : {},
				),
			});
			return ok ? undefined : new Response("no", { status: 400 });
		},
		websocket: {
			open(ws) {
				count(ws.data.path).open++;
				if (ws.data.path === "/greet") ws.send("hello first");
				if (ws.data.path === "/crash") ws.terminate();
			},
			message(ws, msg) {
				if (msg === "close-4403") return ws.close(4403, "nope");
				ws.send(msg);
			},
			close(ws, code) {
				count(ws.data.path).closed++;
				appCloses.push(code);
			},
		},
	});
	proxy = Bun.serve({
		port: 0,
		fetch(req, server) {
			const target = new URL(req.url);
			target.hostname = "127.0.0.1";
			target.port = String(app.port);
			return proxyUpgrade(req, server as any, target, req.headers);
		},
		websocket: proxyHandlers as any,
	});
});

afterAll(() => {
	proxy.stop(true);
	app.stop(true);
});

function connect(
	path: string,
	init: { headers?: Record<string, string>; protocols?: string[] } = {},
) {
	return new Promise<WebSocket>((resolve, reject) => {
		const ws = new WebSocket(`ws://127.0.0.1:${proxy.port}${path}`, init as any);
		ws.binaryType = "arraybuffer";
		ws.onopen = () => resolve(ws);
		ws.onerror = () => reject(new Error("handshake failed"));
	});
}

const next = (ws: WebSocket) =>
	new Promise<string | ArrayBuffer>((r) =>
		ws.addEventListener("message", (e) => r(e.data), { once: true }),
	);
const closed = (ws: WebSocket) =>
	new Promise<{ code: number; reason: string }>((r) =>
		ws.addEventListener("close", (e) => r({ code: e.code, reason: e.reason }), { once: true }),
	);

describe("toSendableCode", () => {
	test("passes sendable codes, maps describe-only and invalid ones", () => {
		for (const code of [1000, 1001, 1011, 1012, 3000, 4403])
			expect(toSendableCode(code, 1011)).toBe(code);
		expect(toSendableCode(1005, 1011)).toBe(1000);
		expect(toSendableCode(1006, 1001)).toBe(1001);
		expect(toSendableCode(1015, 1011)).toBe(1011);
		// Reserved or out of range: Bun's client close() would throw on these.
		for (const code of [0, 999, 1004, 1016, 2000, 2999, 5000])
			expect(toSendableCode(code, 1011)).toBe(1000);
	});
});

describe("dev WebSocket proxy", () => {
	test("text and binary echo through the proxy, headers reach the app", async () => {
		const ws = await connect("/echo", { headers: { authorization: "Bearer t" } });
		expect(seenByApp.at(-1)!.authorization).toBe("Bearer t");
		ws.send("hi");
		expect(await next(ws)).toBe("hi");
		ws.send(new Uint8Array([0, 255, 7]));
		expect([...new Uint8Array((await next(ws)) as ArrayBuffer)]).toEqual([0, 255, 7]);
		ws.close();
	});

	test("a frame the app sends on open is not lost", async () => {
		const ws = await connect("/greet");
		expect(await next(ws)).toBe("hello first");
		ws.close();
	});

	test("an app close code 4403 reaches the client unchanged", async () => {
		const ws = await connect("/echo");
		const done = closed(ws);
		ws.send("close-4403");
		expect(await done).toEqual({ code: 4403, reason: "nope" });
	});

	test("an app that drops the connection (1006) arrives as 1011", async () => {
		const ws = await connect("/crash").catch(() => null);
		// The app may die before or after the client opened; either way no 1006 reaches a live client.
		if (ws) expect((await closed(ws)).code).toBe(1011);
	});

	test("a client close code 1001 reaches the app unchanged", async () => {
		const ws = await connect("/echo");
		ws.close(1001, "tab closed");
		const deadline = Date.now() + 2000;
		while (appCloses.at(-1) !== 1001 && Date.now() < deadline) await Bun.sleep(10);
		expect(appCloses.at(-1)).toBe(1001);
	});

	test("a protocol the app picks is passed to the client", async () => {
		const ws = await connect("/echo", { protocols: ["rig.v1", "rig.v0"] });
		expect(seenByApp.at(-1)!.protocol).toBe("rig.v1, rig.v0");
		expect(ws.protocol).toBe("rig.v1");
		ws.close();
	});

	test("an app refusal is a failed handshake (HTTP 502), like prod", async () => {
		const res = await fetch(`http://127.0.0.1:${proxy.port}/refuse`, {
			headers: {
				connection: "Upgrade",
				upgrade: "websocket",
				"sec-websocket-version": "13",
				"sec-websocket-key": "dGhlIHNhbXBsZSBub25jZQ==",
			},
		});
		expect(res.status).toBe(502);
		await expect(connect("/refuse")).rejects.toThrow("handshake failed");
	});

	test("a client that leaves while the app is slow to accept leaves no app socket", async () => {
		const sock = await Bun.connect({
			hostname: "127.0.0.1",
			port: proxy.port!,
			socket: { data() {} },
		});
		sock.write(
			"GET /slow HTTP/1.1\r\nHost: x\r\nConnection: Upgrade\r\nUpgrade: websocket\r\n" +
				"Sec-WebSocket-Version: 13\r\nSec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\n\r\n",
		);
		await Bun.sleep(50);
		sock.end();
		await Bun.sleep(700);
		// The app did accept; Bun refuses the dead client, so the proxy closes it.
		const slow = count("/slow");
		expect(slow.open).toBe(1);
		expect(slow.closed).toBe(1);
	});

	test("a rebuild closes proxied clients with 1012", async () => {
		const ws = await connect("/echo");
		const done = closed(ws);
		closeProxiedSockets(1012, "Server restarting");
		expect((await done).code).toBe(1012);
	});
});
