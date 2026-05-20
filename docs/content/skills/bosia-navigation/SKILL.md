---
name: bosia-navigation
description: Client-side navigation in Bosia — `<a href>`, `goto()`, form-action `redirect()`, and `window.location.href`. Lifecycle hooks `beforeNavigate` / `afterNavigate`. Mirrors SvelteKit's `$app/navigation` surface; import from `bosia/client`.
triggers:
    - goto
    - navigate
    - programmatic navigation
    - beforeNavigate
    - afterNavigate
    - block navigation
    - unsaved changes prompt
    - redirect after submit
    - full reload
    - window.location
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

# bosia-navigation

## What it builds

Correct client-side navigation. SPA transitions for internal links, form-driven redirects, and a documented escape hatch for full reloads.

## When to use

- Programmatic navigation after an event (button click, async settle, conditional redirect).
- Guarding nav with an unsaved-changes confirm.
- Reacting to navigation lifecycle (analytics, scroll restore, focus management).
- Picking between SPA nav and a full reload.

Anti-trigger: server-side redirects from a loader or action — use `redirect(303, '/x')` (covered by `bosia-elysia-routes`), not `goto()`.

## Rules

### R1 — Four patterns, pick the right one

| Pattern                | When                                                                                  | Re-hydrates?       |
| ---------------------- | ------------------------------------------------------------------------------------- | ------------------ |
| `<a href="/x">`        | Default for any user-visible link.                                                    | No (SPA).          |
| `goto(url, opts?)`     | Programmatic navigation from JS (event handlers, etc.).                               | No (SPA).          |
| `redirect(303, '/x')`  | Inside a form action / server handler post-submit.                                    | No (SPA).          |
| `window.location.href` | Escape hatch — only when client state MUST be torn down (hard logout, tenant switch). | Yes (full reload). |

Prefer SPA paths. `window.location.href` is the last resort.

### R2 — `goto()` returns a Promise

```ts
import { goto } from "bosia/client";

await goto("/dashboard");
await goto("/login", { replaceState: true, invalidateAll: true });
```

The Promise resolves after loaders ran and components mounted. If the URL matches the current route, it resolves immediately without re-running loaders — pass `{ invalidateAll: true }` to force a refresh.

Options:

| Option          | Default | Description                                                            |
| --------------- | ------- | ---------------------------------------------------------------------- |
| `replaceState`  | `false` | Use `history.replaceState` instead of `pushState`.                     |
| `invalidateAll` | `false` | Mark every loader dirty so the destination re-runs all server loaders. |
| `noScroll`      | `false` | Skip the default scroll-to-top.                                        |
| `keepFocus`     | `false` | Reserved — not yet honored.                                            |
| `state`         | —       | Reserved — no shallow routing yet.                                     |

### R3 — Lifecycle hooks auto-unregister

```svelte
<script lang="ts">
	import { beforeNavigate, afterNavigate } from "bosia/client";

	beforeNavigate((nav) => {
		if (hasUnsavedChanges && !confirm("Discard changes?")) {
			nav.cancel();
		}
	});

	afterNavigate((nav) => {
		// analytics, focus mgmt, scroll restore, etc.
	});
</script>
```

Hooks registered inside a component auto-unregister on `onDestroy`. Register them at the top level of `<script>` — not inside event handlers or `$effect`.

### R4 — `nav.cancel()` does not block popstate or unload

The Navigation object:

```ts
interface Navigation {
	from: { url: URL; params: Record<string, string> } | null;
	to: { url: URL; params: Record<string, string> } | null;
	type: "link" | "goto" | "popstate" | "form" | "enter";
	willUnload: boolean;
	cancel: () => void;
}
```

- `cancel()` is a **no-op** when `type === "popstate"` (browser back/forward — pointer already moved).
- `cancel()` is a **no-op** when `willUnload === true` (tab close, external link). To prompt the user, attach a native `beforeunload` listener instead.

### R5 — Form actions over manual `goto()` post-submit

If a form handler should navigate after success, throw `redirect(303, '/x')` from the action with `use:enhance` on the form — Bosia's enhance picks it up and SPA-navigates. Don't `goto()` from the `onSubmit` callback after a manual `fetch`.

```svelte
<form method="POST" action="?/save" use:enhance>
	<!-- … -->
</form>
```

### R6 — `window.location.href` only when you need a teardown

Symptoms that signal "use full reload":

- Auth changed (login, hard logout) and the page-load script must re-evaluate auth state from cookies.
- Multi-tenant context switch where in-memory caches must be discarded.
- After a destructive admin action that invalidates large amounts of client state.

Otherwise: `goto()` is faster (no script re-parse, no re-hydration) and keeps loader caches warm.

## Workflow

1. **Pick the pattern.** Link in UI → `<a href>`. JS event → `goto()`. After form submit → `redirect()` in the action. Auth teardown → `window.location.href`.
2. **If guarding nav**, register `beforeNavigate` at top-of-script. Remember `popstate` / `willUnload` can't be cancelled — handle those via `beforeunload` if you must.
3. **If you need post-nav side effects**, use `afterNavigate` — not a `$effect` on `data`, which is invoked at other times too.
4. **Await `goto()`** when ordering matters (e.g. toast after settle). Don't await it inside a `$effect` body.
5. **Import from `bosia/client`** — not `$app/navigation`. There is no `$app/navigation` alias in Bosia.

## Bosia conventions

- `bosia-routing` — file routing rules. `redirect()` from a form action lives in `+page.server.ts`.
- `bosia-elysia-routes` — `+server.ts` redirects use `new Response(null, { status: 303, headers: { Location: '/x' } })`.
- `bosia-svelte-runes` — register hooks at top of `<script>`, not inside `$effect`.
- `bosia-auth-flow` — login/logout typically uses form action `redirect()`; hard logout may use `window.location.href`.

## Checklist gate

P0:

- [ ] Imports from `bosia/client`, not `$app/navigation`.
- [ ] No `window.location.href` for routine internal navigation — `goto()` instead.
- [ ] `beforeNavigate` / `afterNavigate` registered at top of `<script>`, not inside `$effect` or an event handler.
- [ ] Code does not assume `nav.cancel()` blocks `popstate` or `willUnload` events.
- [ ] Post-submit nav is a form-action `redirect(303, …)`, not a manual `fetch` + `goto`.

P1:

- [ ] `goto()` is awaited when subsequent code depends on the navigation having settled.
- [ ] `invalidateAll: true` used only when you actually need a server reload on same-route nav.
- [ ] `noScroll: true` used only when you have an explicit reason (anchor stays in view, infinite scroll).

## References

Source of truth: `bosia/packages/bosia/src/core/client/navigation.ts` (`goto`, `beforeNavigate`, `afterNavigate`), `router.svelte.ts` (click/popstate interception), `navListeners.ts` (listener registries), `bosia/docs/content/docs/guides/navigation.md` (user-facing guide).
