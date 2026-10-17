// ─── WebSockets (Bun only) ────────────────────────────────
// A `+server.ts` exports `websocket = { upgrade?, open, message, close, … }`.
// resolve() runs `upgrade()` after the hooks, then hands the request to Bun's
// `server.upgrade()`. Bun.serve takes one websocket handler for the whole
// server, so the upgrade carries the route's handlers in an envelope; open()
// keeps them per socket and sets `ws.data` to what upgrade() returned.
//
// Subprotocols are not selectable yet: `upgrade()` returns only data. To add
// it, let the export declare `protocols: string[]` and send the first one the
// client offers as `Sec-WebSocket-Protocol` in server.upgrade's headers. The
// dev proxy already passes it through.

import { AsyncLocalStorage } from "node:async_hooks";

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

type Socket = ServerWebSocket<any>;

/** What server.upgrade() carries until open() unwraps it. */
class Envelope {
	constructor(
		readonly handler: WebSocketHandler<any, any>,
		readonly data: object,
	) {}
}

// Per socket, not on ws.data: one object returned by two routes (a cached
// session user, say) must not carry either route's handlers.
const routeOf = new WeakMap<Socket, WebSocketHandler<any, any>>();

export function isUpgradeRequest(request: Request): boolean {
	return request.method === "GET" && request.headers.get("upgrade")?.toLowerCase() === "websocket";
}

// One per upgrade request, set by BosiaApp.fetch. It holds the Request Bun gave
// (server.upgrade() needs that one, and a hook may pass resolve() a new one)
// and whether the upgrade happened — a per-request flag, so a hook that
// rebuilds or mutates the returned Response can't hide or leak it.
interface UpgradeContext {
	request: Request;
	server: Server<any>;
	upgraded: boolean;
}

const upgrades = new AsyncLocalStorage<UpgradeContext>();

export function runUpgrade<T>(request: Request, server: Server<any>, fn: () => T): T {
	return upgrades.run({ request, server, upgraded: false }, fn);
}

/** True once this request has been upgraded: Bun already sent the 101. */
export function isUpgraded(): boolean {
	return upgrades.getStore()?.upgraded === true;
}

let closing = false;

// Bun answers without a protocol, so a browser that asked for one fails the
// handshake with no error on the server. Warn once per route, not per connect.
const warnedProtocol = new WeakSet<WebSocketHandler<any, any>>();

function warnProtocol(handler: WebSocketHandler<any, any>, request: Request): void {
	const asked = request.headers.get("sec-websocket-protocol");
	if (!asked || warnedProtocol.has(handler)) return;
	warnedProtocol.add(handler);
	console.warn(
		`[WebSocket] ${new URL(request.url).pathname}: the client asked for Sec-WebSocket-Protocol ` +
			`"${asked}", but Bosia can't pick one yet. Browsers fail this handshake; drop the ` +
			`protocols argument from new WebSocket().`,
	);
}

/**
 * Upgrade the current request with `data` as `ws.data`. Returns a placeholder
 * Response (Bun ignores it; isUpgraded() is the signal), or the Response to
 * send instead (bad handshake, a runtime without WebSockets).
 */
export function upgradeRequest(
	handler: WebSocketHandler<any, any>,
	data: object,
	headers: Headers,
): Response {
	const ctx = upgrades.getStore();
	if (!ctx) return new Response("WebSockets are not supported here", { status: 501 });
	warnProtocol(handler, ctx.request);
	if (!ctx.server.upgrade(ctx.request, { data: new Envelope(handler, data) as any, headers })) {
		return new Response("Bad WebSocket handshake", { status: 400 });
	}
	ctx.upgraded = true;
	return new Response(null, { status: 200 });
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
//
// Bun calls these inside the upgrade request's async context; exit() it, so a
// timer or callback started in open() doesn't hold that request for the
// socket's life or see isUpgraded() in its own in-process fetches.
function run(ws: Socket, name: Exclude<keyof WebSocketHandler, "upgrade">, args: unknown[]): void {
	upgrades.exit(() => call(ws, name, args));
}

function call(ws: Socket, name: Exclude<keyof WebSocketHandler, "upgrade">, args: unknown[]): void {
	const handler = routeOf.get(ws);
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
		// The very object upgrade() returned becomes ws.data (an app may keep it
		// in a registry).
		const envelope = ws.data as Envelope;
		routeOf.set(ws, envelope.handler);
		ws.data = envelope.data;
		sockets.add(ws);
		run(ws, "open", []);
		// An upgrade still in its async upgrade() during the shutdown sweep opens
		// after it: the app has seen open() and gets close(), so it can clean up.
		if (closing) ws.close(1001, "Server shutting down");
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

/** Shutdown: close every open socket with 1001 (clients reconnect elsewhere),
 *  and any that opens from here on. */
export function closeAllSockets(): void {
	closing = true;
	closeEach(sockets, 1001, "Server shutting down");
}

export function closeEach(
	list: Iterable<ServerWebSocket<any>>,
	code: number,
	reason: string,
): void {
	for (const ws of [...list]) {
		try {
			ws.close(code, reason);
		} catch {
			/* already closed */
		}
	}
}
