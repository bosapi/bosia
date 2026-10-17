// ─── Dev Proxy: WebSockets ────────────────────────────────
// The dev proxy forwards HTTP with fetch(), which can't carry an upgrade. This
// opens the app's socket first and upgrades the client only once the app has
// accepted, so a refusal reaches the client as a failed handshake — what a
// browser sees in prod too (it never learns the status). Then frames are piped
// both ways, type kept.
//
// Simple version: no backpressure across the proxy hop, frames sent during a
// restart are dropped, and cookies the app sets on its 101 don't reach the
// client (Bun's client WebSocket doesn't expose handshake headers). If that
// ever matters, buffer with a cap (close with 1013 past it) and do the
// upstream handshake over a raw socket to read its headers.

import type { Server, ServerWebSocket, WebSocketHandler } from "bun";

interface ProxyData {
	upstream: WebSocket;
	client: ServerWebSocket<ProxyData> | null;
	/** Frames the app sent before the client socket opened. */
	pending: (string | ArrayBuffer)[];
	/** The app closed before the client socket opened. */
	early: { code: number; reason: string } | null;
}

// Handshake headers belong to each hop; everything else (cookie,
// authorization, origin, x-forwarded-*) goes through to the app.
const HOP_HEADERS = new Set([
	"host",
	"connection",
	"upgrade",
	"content-length",
	"sec-websocket-key",
	"sec-websocket-version",
	"sec-websocket-extensions",
	"sec-websocket-protocol",
]);

const UPSTREAM_TIMEOUT_MS = 10_000;

const proxied = new Set<ServerWebSocket<ProxyData>>();

/** A code the server side may send: 1005/1006/1015 only describe a close. */
function toClientCode(code: number): number {
	if (code === 1005) return 1000;
	if (code === 1006 || code === 1015) return 1011;
	return code;
}

/** A client WebSocket may only send 1000 or 3000–4999. */
function toAppCode(code: number): number {
	return code === 1000 || (code >= 3000 && code <= 4999) ? code : 1000;
}

/**
 * Upgrade `req` through to `target` (an http:// URL on the app server).
 * Returns undefined once upgraded, or the Response to send instead.
 */
export async function proxyUpgrade(
	req: Request,
	server: Server<ProxyData>,
	target: URL,
	inHeaders: Headers,
): Promise<Response | undefined> {
	const headers: Record<string, string> = {};
	for (const [k, v] of inHeaders) if (!HOP_HEADERS.has(k.toLowerCase())) headers[k] = v;
	const protocols =
		req.headers
			.get("sec-websocket-protocol")
			?.split(",")
			.map((p) => p.trim())
			.filter(Boolean) ?? [];

	const url = new URL(target);
	url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
	const upstream = new WebSocket(url.href, { headers, protocols } as any);
	upstream.binaryType = "arraybuffer";
	const data: ProxyData = { upstream, client: null, pending: [], early: null };

	upstream.addEventListener("message", (e) => {
		if (data.client) data.client.send(e.data);
		else data.pending.push(e.data);
	});
	upstream.addEventListener("close", (e) => {
		if (!data.client) data.early = { code: e.code, reason: e.reason };
		else if (proxied.has(data.client)) data.client.close(toClientCode(e.code), e.reason);
	});

	const opened = await new Promise<boolean>((resolve) => {
		const timer = setTimeout(() => resolve(false), UPSTREAM_TIMEOUT_MS);
		const done = (ok: boolean) => {
			clearTimeout(timer);
			resolve(ok);
		};
		upstream.addEventListener("open", () => done(true), { once: true });
		upstream.addEventListener("error", () => done(false), { once: true });
		upstream.addEventListener("close", () => done(false), { once: true });
	});
	if (!opened) {
		upstream.close();
		return new Response("WebSocket upgrade refused by app", { status: 502 });
	}

	const ok = server.upgrade(req, {
		data,
		headers: new Headers(upstream.protocol ? { "Sec-WebSocket-Protocol": upstream.protocol } : {}),
	});
	if (ok) return undefined;
	upstream.close();
	return new Response("Bad WebSocket handshake", { status: 400 });
}

export const proxyHandlers: WebSocketHandler<ProxyData> = {
	open(ws) {
		const data = ws.data;
		data.client = ws;
		proxied.add(ws);
		for (const frame of data.pending) ws.send(frame);
		data.pending = [];
		if (data.early) ws.close(toClientCode(data.early.code), data.early.reason);
	},
	message(ws, message) {
		const { upstream } = ws.data;
		if (upstream.readyState === WebSocket.OPEN) upstream.send(message);
	},
	close(ws, code, reason) {
		proxied.delete(ws);
		const { upstream } = ws.data;
		if (upstream.readyState === WebSocket.OPEN || upstream.readyState === WebSocket.CONNECTING) {
			upstream.close(toAppCode(code), reason);
		}
	},
};

/** Close every proxied client — 1012 on a rebuild, so clients reconnect to the new app. */
export function closeProxiedSockets(code: number, reason: string): void {
	for (const ws of [...proxied]) {
		try {
			ws.close(code, reason);
		} catch {
			/* already closed */
		}
	}
}
