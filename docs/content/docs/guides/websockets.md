---
title: WebSockets
description: Two-way, long-lived connections from a +server.ts route — auth through your hooks, text and binary frames, backpressure and clean shutdowns. Bun only.
---

A `+server.ts` route can accept WebSocket connections by exporting `websocket`. The upgrade goes through the normal request pipeline first, so `hooks.server.ts`, `locals`, cookies, `BASE_PATH` and route `params` all work as they do for any other request.

```ts
// src/routes/rig/[id]/+server.ts
import type { WebSocketHandler } from "./$types";

type Conn = { rigId: string; user: string };

export const websocket: WebSocketHandler<Conn> = {
	// Runs after hooks.server.ts. Return the connection's data, or a Response to refuse.
	async upgrade({ params, locals }) {
		if (!locals.user) return new Response(null, { status: 401 });
		return { rigId: params.id, user: locals.user.id };
	},
	open(ws) {
		ws.subscribe(`rig:${ws.data.rigId}`);
	},
	message(ws, msg) {
		// string for text frames, Buffer for binary frames
		ws.publish(`rig:${ws.data.rigId}`, msg);
	},
	close(ws, code, reason) {},
};
```

`ws` is Bun's [`ServerWebSocket`](https://bun.sh/docs/api/websockets): `send`, `sendText`, `sendBinary`, `close(code, reason)`, `ping`, `getBufferedAmount()`, `subscribe`/`publish` and `ws.data` all work as Bun documents them. The handlers you can export are `upgrade`, `open`, `message`, `drain`, `close`, `ping` and `pong`. All of them are optional.

A route can export `websocket` next to `GET`/`POST`. A plain `GET` or `HEAD` to a route that only has `websocket` gets `426 Upgrade Required`.

:::note[Bun only]
WebSockets need the Bun runtime. A `websocket` export fails the Cloudflare Workers build with a clear message.
:::

## Auth and `upgrade()`

`upgrade(event)` gets the same event as an API handler (`request`, `url`, `params`, `locals`, `cookies`, `platform`) and may be `async`, e.g. to look a token up in the database.

- **Return an object** → it becomes `ws.data`, the very same object (keep it in a registry if you like). Return a **fresh object per connection**.
- **Return a `Response`** → the connection is refused with it (e.g. `401`).
- **Return nothing** → `ws.data` is `{}`.
- **Throw** → answered like an API handler: `error(403)` gives `403`, `redirect()` gives a 3xx, anything else `500`.

A browser can't read the status of a refused WebSocket: it only sees an `error` event and a close with code `1006`. Non-browser clients (Bun, Node) do see the status.

### Cookies on the upgrade

Cookies your `handle` hook sets **before** `await resolve(event)` (e.g. a refreshed session) are sent on the `101` response. Cookies set **after** `resolve()` returns are lost — the `101` has already gone out. Headers a hook adds to the response returned by `resolve()` are ignored for upgrades.

## Origin check

`GET` requests skip the CSRF check, but a cross-site page could still open a WebSocket that carries your user's cookies. So an upgrade gets its own origin check:

- An `Origin` that is not your site → `403`.
- `CSRF_ALLOWED_ORIGINS` and `CSRF_EXEMPT_PATHS` apply as they do for forms.
- **No `Origin` at all is allowed.** Browsers always send one; a request without it comes from a non-browser client (a CLI, a device), which has no ambient cookies to abuse. Authenticate those with a token (`Authorization` header) in your hook.

## Frames and backpressure

Text frames arrive as `string`, binary frames as `Buffer` — raw bytes (e.g. PTY output) come through unchanged.

`ws.send()` returns the number of bytes sent, `-1` when the data was queued because the client is slow (backpressure), or `0` when it was dropped — which happens once the queue passes `WS_BACKPRESSURE_LIMIT`. So on `-1`, stop sending and wait for `drain`:

```ts
export const websocket: WebSocketHandler<{ pty: Pty }> = {
	message(ws, msg) {
		ws.data.pty.write(msg);
	},
	open(ws) {
		ws.data.pty.onData((chunk) => {
			if (ws.send(chunk) === -1) ws.data.pty.pause();
		});
	},
	drain(ws) {
		ws.data.pty.resume();
	},
};
```

`ws.getBufferedAmount()` tells you how many bytes are still queued.

## Errors

A handler that throws (or returns a rejected promise) closes that socket with `1011` and logs the error. The server keeps running.

## Shutdown and restarts

| When                                     | Close code | Client should               |
| ---------------------------------------- | ---------- | --------------------------- |
| Server stops (`SIGTERM`, deploy)         | `1001`     | Reconnect (with backoff)    |
| Dev rebuild (`bun run dev` restarts app) | `1012`     | Reconnect to the new build  |
| Handler error                            | `1011`     | Reconnect, maybe report     |
| Your own `ws.close(4xxx, …)`             | as sent    | Whatever your protocol says |

An upgrade still inside an async `upgrade()` when the server stops still opens — so `open` and `close` run and you can clean up — and is closed with `1001` right away.

Reconnect with a backoff (e.g. 0.5s, 1s, 2s … up to 30s) so a restarting server isn't flooded.

## Dev server

`bun run dev` proxies WebSockets to the app: it connects to the app first and only then accepts the client, so a browser sees a refusal the same way as in production. Text and binary frames and close codes go through unchanged. Dev-only differences: a refused handshake answers `502` instead of the app's own status (only non-browser clients can tell), cookies the app sets on the `101` don't reach the client, and there is no backpressure across the proxy hop.

## Access logs and `onResponse`

An upgrade has no real `Response` (a `101` can't be built), so `onResponse` observers get `status: 101` and `upgraded: true`. Read `status`, not `response.status`. The built-in access log does.

## Limits

| Variable                | Default | Meaning                                                           |
| ----------------------- | ------- | ----------------------------------------------------------------- |
| `WS_MAX_PAYLOAD`        | `16M`   | Largest frame accepted                                            |
| `WS_IDLE_TIMEOUT`       | `120`   | Seconds without a frame before the socket closes (Bun auto-pings) |
| `WS_BACKPRESSURE_LIMIT` | `16M`   | Bytes queued for a slow client                                    |
| `WS_COMPRESS`           | `false` | `permessage-deflate` compression                                  |

Open sockets don't count toward `MAX_INFLIGHT`; only the upgrade request does.

Subprotocols aren't supported yet. Bosia can't answer `new WebSocket(url, ["chat"])`, so the browser fails the handshake. The server logs a warning the first time a route gets one.

## Re-running loaders on a message

To refresh page data when a message arrives, call `invalidate()` in the browser's `onmessage` — see [Data Invalidation](/guides/data-invalidation).
