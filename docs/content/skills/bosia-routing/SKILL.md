---
name: bosia-routing
description: File-based routing in Bosia — `+page.svelte` registers the route; folders with only `+page.server.ts` 404. Action-only endpoints use `+server.ts`. Page data does not auto-merge with layout data.
triggers:
  - new route
  - add page
  - server action
  - form action
  - layout data
  - logout endpoint
  - websocket
od:
  mode: convention
  category: framework
bosia:
  design: false
  requires:
    blocks: []
    themes: []
    components: []
    feats: []
  targets:
    routes: []
  stack: [svelte-5-runes, elysia-routes]
---

# bosia-routing

Correct file-routing under `src/routes/` — no 404 traps, no missing page data.

When: adding a page/layout/endpoint/API route, wiring a `<form>` POST, or a page that needs a parent layout's value. Anti-trigger: component work not touching `src/routes/`.

## Rules

R1 — `+page.svelte` registers the route. A folder with only `+page.server.ts` is invisible to the router — the page AND its `actions` return 404.

R2 — Action-only endpoints (logout, POST handlers, webhooks) use `+server.ts` with named verb exports; `<form method="POST" action="/logout">` hits `POST`.

```ts
// src/routes/logout/+server.ts
export async function POST() {
	return new Response(null, { status: 303, headers: { Location: "/login" } });
}
```

R2b — WebSockets (Bun only; fails the Workers build): `+server.ts` exports `websocket: WebSocketHandler<Data>` (from `./$types`) with `upgrade?`, `open`, `message`, `drain`, `close`, `ping`, `pong`. Auth in `hooks.server.ts`/`upgrade(event)` (may be async): return a fresh object → `ws.data`, a `Response` → refused. Cross-site `Origin` → 403; no `Origin` (CLI/device) passes, so token-auth those. `send()` → `-1` means pause until `drain`; past `WS_BACKPRESSURE_LIMIT` it returns `0` and drops the data. Plain `GET`/`HEAD` → 426. Clients reconnect on `1001` (shutdown) / `1012` (dev rebuild). Guide: /guides/websockets.

```ts
// src/routes/rig/[id]/+server.ts
import type { WebSocketHandler } from "./$types";
export const websocket: WebSocketHandler<{ rigId: string }> = {
	upgrade({ params, locals }) {
		if (!locals.user) return new Response(null, { status: 401 });
		return { rigId: params.id };
	},
	message(ws, msg) {
		ws.send(msg); // string = text frame, Buffer = binary frame
	},
};
```

R3 — Page data ≠ layout data. `+page.svelte`'s `data` holds ONLY its own loader output (+ `params`); Bosia keeps pageData/layoutData separate (no SvelteKit auto-merge). To read a parent `+layout.server.ts` value, add `+page.server.ts` calling `parent()`:

```ts
// src/routes/(private)/dashboard/+page.server.ts
export async function load({ parent }) {
	const { user } = await parent();
	return { user };
}
```

Don't use `parent()` for scope identifiers (`farmId`/`orgId`/`userId`) — read those from `locals`, populated in `hooks.server.ts`. `parent()` is fine for view-layer data, but `locals` is the source of truth for cross-loader scope and authz.

R3a — All loaders (layouts + page) start at once; `parent()` waits for the layouts above. Do independent queries BEFORE `await parent()`. Code before `await parent()` runs even if a layout redirects (response still the layout's) — guard in hooks, or `await parent()` first. Dev warns (once per route and guard) when a layout `redirect()`/`error(401|403)` fires with loaders below it; it flags the guard's place, so only moving auth guards to hooks silences it.

R3b — Loader event fields: `url`, `params`, `locals`, `cookies`, `fetch`, `parent`, `metadata`, `depends`, `setHeaders`. `setHeaders({ "cache-control": "..." })` sets response headers from any loader — same header twice throws, `set-cookie` forbidden (use `cookies`), no-op during prerender.

R3c — Page flags (`prerender`, `ssr`, `actions`, `trailingSlash`) are read by importing every `+page.server.ts`/`+layout.server.ts`/`+server.ts` at build and dev-rebuild, so any export spelling works. Their top-level code runs then: a throw (DB connect, missing env) or a load pending >30s fails `bosia build` (dev warns, keeps last flags) — keep side effects inside `load()`. Dev re-reads flags only when a route server file's mtime changes.

R4 — Groups & dynamic segments: `(group)/` invisible in URL, shares layouts (`(public)`, `(private)`); `[param]/` → `params.param`; `[...rest]/` catch-all (also after a param: `[lang]/[...rest]`; must be the last segment; brackets wrap a whole segment (no `[id].json`, no `[[opt]]`/`[id?]`, no `[id=integer]` matchers); names are TS identifiers (letters/digits/`_$`, no leading digit: `[user_id]` ok, `[post-id]` fails) and unique — else the build fails; prerender `entries()` values use only `A-Za-z0-9-_.~` (+ `/` in a catch-all), so slugify `50%-off` → `50-off`; a value whose URL another route serves fails — `/blog/[slug]` giving `new` next to `blog/new/` (case is ignored: `New`, or a prerendered `/about` next to `/About`, fail too; param-only overlaps don't), or a slug where a `+server.ts` answers; a prerendered page must answer `2xx` HTML, so a loader `error()`/`redirect()` fails the build). Precedence is per segment, left to right: static > `[param]` > `[...rest]` (`/label/[id]` beats `/[a]/[b]`). Never put two pages at one URL (`+page.svelte` + `(public)/+page.svelte`, or `[id]` + `(g)/[slug]`): the build fails with "routes conflict with each other".

R5 — Layout chain: `+layout.svelte` wraps children; `+layout.server.ts` loads for the subtree; `+error.svelte` renders to its depth; `scope` (`public`/`private`) inherits from the nearest layout that sets it.

R5b — `+loading.svelte` (optional): client skeleton shown while navigating TO that folder's page. Renders nested in the layouts SHARED with the current page (added layouts aren't mounted yet — the file draws that chrome itself). Real URL changes only, not `invalidate()`. Per-folder only — no parent inheritance yet.

R6 — Authenticated UI MUST live under `(private)`. Any route reading `locals.user` / `locals.can()` (dashboard, admin/\*, settings, internal CRUD) goes under `(private)/`, never `(public)/`. Test: "Okay with a signed-out stranger loading this URL?" — No / unsure → `(private)`. If `(private)/+layout.server.ts` is missing, CREATE it to enforce session presence — don't demote routes to `(public)` to work around it.

❌ `src/routes/(public)/admin/produk/+page.svelte`
✅ `src/routes/(private)/admin/produk/+page.svelte`

## Workflow

1. Decide shape: UI page → `+page.svelte` (+ optional `+page.server.ts`); action-only → `+server.ts`; shared shell → `+layout.*`.
2. Group: public marketing → `(public)`; authenticated → `(private)`.
3. If the page reads layout values, add `+page.server.ts` with `await parent()`.
4. Private routes enforce `can()` in their loader/action/handler (see bosia-rbac-permission).

## Checklist

P0:

- [ ] Folder has `+page.server.ts` but no `+page.svelte` → add `+page.svelte` or move logic to `+server.ts`.
- [ ] Page reads a layout-loader value → has `+page.server.ts` calling `parent()`.
- [ ] Form `action` URL resolves to a `+page.server.ts` `actions` (with `+page.svelte`) OR a `+server.ts` handler.
- [ ] Private route enforces RBAC.
- [ ] No `admin/*`, `dashboard`, `settings` under `(public)`.

P1:

- [ ] Groups used to share layouts.
- [ ] `+error.svelte` at appropriate depth.
- [ ] `+loading.svelte` added for slow-loading pages that need a skeleton during nav.
- [ ] `trailingSlash` exported from a server module, not a page.

Related: bosia-svelte-runes (`$props()` not `export let`), bosia-elysia-routes (`+server.ts` shape), bosia-navigation (`goto`/`beforeNavigate` from `bosia/client`), bosia-rbac-permission.

Source: `bosia/packages/bosia/src/core/scanner.ts` (registration, `+loading.svelte` detection), `renderer.ts` (data separation), `client/App.svelte` (loader rendering during nav).
