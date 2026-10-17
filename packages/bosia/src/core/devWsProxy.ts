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

import { closeEach } from "./websocket.ts";

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

/**
 * A close code `close()` accepts. 1005/1006/1015 only describe a close:
 * 1005 (no code) becomes 1000, 1006/1015 (connection lost) become `lost`.
 * Reserved or out-of-range codes become 1000; Bun's client close() throws on them.
 */
export function toSendableCode(code: number, lost: number): number {
	if (code === 1006 || code === 1015) return lost;
	const valid =
		(code >= 1000 && code <= 1003) ||
		(code >= 1007 && code <= 1014) ||
		(code >= 3000 && code <= 4999);
	return valid ? code : 1000;
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
		else if (proxied.has(data.client)) data.client.close(toSendableCode(e.code, 1011), e.reason);
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
	// The app enforces WS_MAX_PAYLOAD (and closes with 1009, passed through);
	// the proxy must not cut frames off at Bun's 16 MB default first.
	maxPayloadLength: 2 ** 30,
	open(ws) {
		const data = ws.data;
		data.client = ws;
		proxied.add(ws);
		for (const frame of data.pending) ws.send(frame);
		data.pending = [];
		if (data.early) ws.close(toSendableCode(data.early.code, 1011), data.early.reason);
	},
	message(ws, message) {
		const { upstream } = ws.data;
		if (upstream.readyState === WebSocket.OPEN) upstream.send(message);
	},
	close(ws, code, reason) {
		proxied.delete(ws);
		const { upstream } = ws.data;
		if (upstream.readyState === WebSocket.OPEN || upstream.readyState === WebSocket.CONNECTING) {
			upstream.close(toSendableCode(code, 1001), reason);
		}
	},
};

/** Close every proxied client — 1012 on a rebuild, so clients reconnect to the new app. */
export function closeProxiedSockets(code: number, reason: string): void {
	closeEach(proxied, code, reason);
}
