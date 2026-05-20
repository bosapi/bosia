// ─── Bosia Client API ─────────────────────────────────────
// Client-only helpers — import from "bosia/client".
// Kept separate from "bosia" because these modules transitively
// reference the bundler-virtual `bosia:routes` module and runtime
// `window`, which break server-side imports (e.g. `+page.server.ts`
// loaded directly by the prerenderer).
//
// Usage in user apps:
//   import { enhance } from "bosia/client";

export { enhance } from "../core/client/enhance.ts";
export type { SubmitFunction, ActionResult } from "../core/client/enhance.ts";
export {
	afterNavigate,
	beforeNavigate,
	goto,
	invalidate,
	invalidateAll,
} from "../core/client/navigation.ts";
export type { GotoOptions, Navigation, NavigationTarget } from "../core/client/navigation.ts";
