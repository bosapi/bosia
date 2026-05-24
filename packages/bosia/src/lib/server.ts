// ─── Bosia Server API ─────────────────────────────────────
// Server-only helpers — import from "bosia/server".
// Kept separate from "bosia" because these modules touch server-process
// state (the response-cache Map, `process.env`) and have no meaning in
// the browser. Importing them through the shared `bosia` barrel would
// drag `process.env` reads into client bundles via the lib re-export
// graph (see ROADMAP v0.6.0 entry on the Safari hydration ReferenceError).
//
// Usage in user apps (form actions, +server.ts, hooks):
//   import { invalidate, invalidateAll } from "bosia/server";

export { invalidate, invalidateAll } from "../core/cache.ts";
