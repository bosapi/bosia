// ─── WebSockets (Bun only) ────────────────────────────────
// A `+server.ts` exports `websocket = { upgrade?, open, message, close, … }`.
// resolve() runs `upgrade()` after the hooks, then hands the request to Bun's
// `server.upgrade()`. Bun.serve takes one websocket handler for the whole
// server, so the shared handlers below find each connection's route handlers
// on its `ws.data`, under a hidden symbol.
//
// Subprotocols are not selectable yet: `upgrade()` returns only data. To add
// it, let the export declare `protocols: string[]` and send the first one the
// client offers as `Sec-WebSocket-Protocol` in server.upgrade's headers. The
// dev proxy already passes it through.

import type { Server, ServerWebSocket, WebSocketHandler as BunWebSocketHandler } from "bun";

import type { RequestEvent } from "./hooks.ts";

/** What a `+server.ts` exports as `websocket`. `ws` is Bun's ServerWebSocket. */
export interface WebSocketHandler<T extends object = {}, E = RequestEvent> {
	/**
	 * Runs after `hooks.server.ts`, so `event.locals` is set. Return the
	 * connection's `ws.data` (a fresh object per connection), or a Response to
	 * refuse. A thrown `error()` / `redirect()` answers like an API handler.
	 */
	upgrade?(event: E): T | Response | void | Promise<T | Response | void>;
	open?(ws: ServerWebSocket<T>): unknown;
	/** `string` for text frames, `Buffer` for binary frames. */
	message?(ws: ServerWebSocket<T>, message: string | Buffer): unknown;
	/** The socket can take more data again after `send()` returned -1. */
	drain?(ws: ServerWebSocket<T>): unknown;
	close?(ws: ServerWebSocket<T>, code: number, reason: string): unknown;
	ping?(ws: ServerWebSocket<T>, data: Buffer): unknown;
	pong?(ws: ServerWebSocket<T>, data: Buffer): unknown;
}

export interface WebSocketOptions {
	maxPayloadLength: number;
	idleTimeout: number;
	backpressureLimit: number;
	perMessageDeflate: boolean;
}

const WS_ROUTE = Symbol("bosia.websocket");

type Socket = ServerWebSocket<Record<PropertyKey, any>>;

/** Returned by resolve() after a successful upgrade; BosiaApp answers Bun with `undefined`. */
export const UPGRADED = new Response(null, { status: 200 });

export function isUpgradeRequest(request: Request): boolean {
	return request.method === "GET" && request.headers.get("upgrade")?.toLowerCase() === "websocket";
}

// The Bun server each upgrade request arrived on — `server.upgrade()` needs it,
// and the framework's handlers only see the Request.
const servers = new WeakMap<Request, Server<any>>();

export function bindServer(request: Request, server: Server<any>): void {
	servers.set(request, server);
}

/**
 * Upgrade `request` with `data` as `ws.data`. Returns UPGRADED, or the Response
 * to send instead (bad handshake, or a runtime without WebSockets).
 */
export function upgradeRequest(
	request: Request,
	handler: WebSocketHandler<any, any>,
	data: object,
	headers: Headers,
): Response {
	const server = servers.get(request);
	if (!server) return new Response("WebSockets are not supported here", { status: 501 });
	// The returned object itself becomes ws.data (an app may keep it in a
	// registry); only a frozen/sealed one is copied so the symbol can be added.
	// One object returned from two routes would carry the last route's handlers.
	const target = Object.isExtensible(data) ? data : { ...data };
	Object.defineProperty(target, WS_ROUTE, { value: handler, configurable: true });
	return server.upgrade(request, { data: target as any, headers })
		? UPGRADED
		: new Response("Bad WebSocket handshake", { status: 400 });
}

// ─── Shared Bun handlers ─────────────────────────────────

const sockets = new Set<Socket>();

function fail(ws: Socket, err: unknown): void {
	console.error("WebSocket handler error:", err);
	try {
		ws.close(1011, "Internal error");
	} catch {
		/* already closed */
	}
}

// A user handler's throw or rejection closes that socket with 1011; it must
// never reach the prod `uncaughtException` handler, which exits the process.
function run(ws: Socket, name: Exclude<keyof WebSocketHandler, "upgrade">, args: unknown[]): void {
	const handler = ws.data?.[WS_ROUTE] as WebSocketHandler<any> | undefined;
	const fn = handler?.[name] as ((...a: unknown[]) => unknown) | undefined;
	if (!fn) return;
	try {
		const out = fn.call(handler, ws, ...args);
		if (out instanceof Promise) out.catch((err) => fail(ws, err));
	} catch (err) {
		fail(ws, err);
	}
}

export const websocketHandlers: BunWebSocketHandler<any> = {
	open(ws) {
		sockets.add(ws);
		run(ws, "open", []);
	},
	message(ws, message) {
		run(ws, "message", [message]);
	},
	drain(ws) {
		run(ws, "drain", []);
	},
	close(ws, code, reason) {
		sockets.delete(ws);
		run(ws, "close", [code, reason]);
	},
	ping(ws, data) {
		run(ws, "ping", [data]);
	},
	pong(ws, data) {
		run(ws, "pong", [data]);
	},
};

/** Close every open socket — 1001 tells clients to reconnect elsewhere. */
export function closeAllSockets(code = 1001, reason = "Server shutting down"): void {
	for (const ws of [...sockets]) {
		try {
			ws.close(code, reason);
		} catch {
			/* already closed */
		}
	}
}

export function openSocketCount(): number {
	return sockets.size;
}
