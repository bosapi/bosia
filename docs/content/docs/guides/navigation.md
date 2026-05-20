---
title: Navigation
description: Programmatic and link-based navigation in Bosia — goto(), beforeNavigate, afterNavigate, form actions, and the full-reload escape hatch.
---

Bosia ships four navigation patterns that mirror SvelteKit:

1. Plain `<a href>` links — the router intercepts.
2. `goto()` — programmatic SPA navigation.
3. Form action `redirect(303, '/x')` — server-driven post-submit nav.
4. `window.location.href` — full browser reload (escape hatch).

The first three are SPA — they don't re-execute the entry script. The fourth tears down and re-hydrates.

## `<a href>`

```svelte
<a href="/dashboard">Dashboard</a>
```

Bosia's click handler intercepts plain anchor clicks and runs `router.navigate()`. Modifier-clicks (Cmd, Ctrl, middle-click) and `target="_blank"` fall through to the browser, so "open in new tab" works as expected. `rel="external"` and `download` also opt out.

## `goto()`

```ts
import { goto } from "bosia/client";

await goto("/dashboard");
await goto("/login", { replaceState: true, invalidateAll: true });
```

`goto()` returns a Promise that resolves after the navigation settles (loaders ran, components mounted).

### Options

| Option          | Default | Description                                                            |
| --------------- | ------- | ---------------------------------------------------------------------- |
| `replaceState`  | `false` | Use `history.replaceState` instead of `pushState`.                     |
| `invalidateAll` | `false` | Mark every loader dirty so the destination re-runs all server loaders. |
| `noScroll`      | `false` | Skip the default scroll-to-top after navigation.                       |
| `keepFocus`     | `false` | Reserved — not yet honored.                                            |
| `state`         | —       | Reserved — Bosia has no shallow routing yet.                           |

If the URL matches the current route, `goto()` resolves immediately without re-running loaders (call `invalidateAll: true` to force a refresh).

## Lifecycle hooks

`beforeNavigate` runs before each client-side navigation. The callback may call `nav.cancel()` to block the navigation (except on browser back/forward — see below).

```svelte
<script lang="ts">
	import { beforeNavigate, afterNavigate } from "bosia/client";

	beforeNavigate((nav) => {
		if (hasUnsavedChanges && !confirm("Discard changes?")) {
			nav.cancel();
		}
	});

	afterNavigate((nav) => {
		console.log("navigated to", nav.to?.url.pathname);
	});
</script>
```

Both auto-unregister when the calling component is destroyed.

### The Navigation object

```ts
interface Navigation {
	from: { url: URL; params: Record<string, string> } | null;
	to: { url: URL; params: Record<string, string> } | null;
	type: "link" | "goto" | "popstate" | "form" | "enter";
	willUnload: boolean;
	cancel: () => void;
}
```

- `type` — how the navigation was triggered.
- `willUnload` — `true` when the browser is about to tear down the page (closed tab, external link). For these events `cancel()` is a no-op; use `addEventListener("beforeunload", ...)` directly to prompt the user.
- `cancel()` on a `popstate` (back/forward) navigation is also a no-op — the browser has already moved its history pointer by the time the listener runs.

## Form actions

Form actions that throw `redirect(303, "/x")` navigate via the router automatically when wrapped with `use:enhance`:

```svelte
<form method="POST" action="?/logout" use:enhance>
	<button>Log out</button>
</form>
```

See [Form Actions](/docs/guides/form-actions/) for the full story.

## `window.location.href` — full reload

Use only when you genuinely need to tear down all client state (e.g. logging out, switching tenants in a multi-tenant app where a fresh runtime context is desired):

```ts
function hardLogout() {
	document.cookie = "session=; Max-Age=0";
	window.location.href = "/";
}
```

For internal navigation prefer `goto()` — it's faster (no script re-parse, no re-hydration cost) and preserves the loader cache where possible.
