// ─── Bosia Public API ─────────────────────────────────────
// Usage in user apps:
//   import { cn, sequence } from "bosia"
//   import type { RequestEvent, LoadEvent, Handle, Cookies } from "bosia"

export { cn, getServerTime } from "./utils.ts";
export { sequence } from "../core/hooks.ts";
export { error, redirect, fail } from "../core/errors.ts";
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
