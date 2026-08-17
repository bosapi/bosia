/// <reference path="../ambient.d.ts" />

// ─── Bosia Public API ─────────────────────────────────────
// Usage in user apps:
//   import { cn, sequence } from "bosia"
//   import type { RequestEvent, LoadEvent, Handle, Cookies } from "bosia"

export { cn, getServerTime } from "./utils.ts";
export { sequence, NO_FRAME_GUARD_HEADER } from "../core/hooks.ts";
export { error, redirect, fail } from "../core/errors.ts";
// `base` is the BASE_PATH the app is mounted under, "" at the origin root.
// Almost nothing needs it: `redirect()` and every href in rendered markup are
// rebased for you. It exists for the one case the framework cannot see — an
// absolute URL an app builds by hand, e.g. `${url.origin}${base}/atur-sandi`
// for a link that will be pasted somewhere else. `event.url.pathname` is app
// space by the time a load() or action sees it, so never prepend it there.
import { currentBase } from "../core/appBase.ts";
export const base: string = currentBase();
// `invalidate` / `invalidateAll` (server response-cache eviction) live in
// "bosia/server" — they touch server-process state and pulling them into
// the shared barrel leaks `process.env` reads into client bundles.
export type { HttpError, Redirect, RedirectOptions, ActionFailure } from "../core/errors.ts";
export type {
	RequestEvent,
	LoadEvent,
	LoaderDeps,
	MetadataEvent,
	Metadata,
	Handle,
	ResolveFunction,
	Cookies,
	CookieOptions,
} from "../core/hooks.ts";
export type { CsrfConfig } from "../core/csrf.ts";
export type { CorsConfig } from "../core/cors.ts";
export { defineConfig } from "../core/types/plugin.ts";
export type {
	BosiaPlugin,
	BosiaConfig,
	BuildContext,
	DevContext,
	RenderContext,
	BuildTarget,
} from "../core/types/plugin.ts";
