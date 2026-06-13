---
name: bosia-svelte-runes
description: Svelte 5 Runes are the only reactive primitives in Bosia code. Never legacy `let`-reactivity, `$:`, `export let`, or stores when runes work.
triggers:
  - svelte component
  - reactive state
  - component props
  - derived value
  - effect
  - $state
  - $derived
  - $effect
  - currentPath
  - page.url.pathname
  - ReferenceError
  - undefined variable
  - stale content on navigation
  - page not updating on slug change
  - dynamic route reuse
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
  stack: [svelte-5-runes]
---

# bosia-svelte-runes

Runes-only Svelte 5. No legacy reactivity, no stores when local state suffices. Applies to every `.svelte` / `.svelte.ts` file, no exceptions.

## Rules

R1 — State: `$state`. `let count = $state(0)`, `let user = $state<User | null>(null)`. Never `let count = 0` for reactive values; never `writable`/`readable` for component-local state.

R2 — Props: `$props()`, typed inline on the destructure. Never `export let`.

```svelte
let { title, items = [], onSelect }:
	{ title: string; items?: Item[]; onSelect?: (i: Item) => void } = $props();
```

R3 — Derived: `$derived` / `$derived.by`. Never `$: count = items.length`.

```svelte
let count = $derived(items.length); let total = $derived.by(() => items.reduce((s, i) => s +
i.price, 0));
```

R3.5 — Anything computed from `data`/props MUST be `$derived`. The component instance is REUSED across client navigations to the same route file (`[slug]/+page.svelte` → another slug) — the router updates `data`/`$props()` in place without remounting. A plain `const` runs once at mount and never recomputes → stale content after the URL changes.

```svelte
let {data}: PageProps = $props(); const product = getProductBySlug(data.slug); // ❌ frozen at first
mount let product = $derived(getProductBySlug(data.slug)); // ✅ recomputes on slug change
```

This passes SSR, fresh-mount navigation, and `svelte-check`, so it only fails navigating between two URLs of the same dynamic route — easy to miss. Rule: any value reading `data.*`/a prop/a `$state`/`$derived` whose source can change while mounted MUST be `$derived` — including chained derivations (e.g. `related` from `product`).

R4 — Effect: `$effect` sparingly, side effects only (subscriptions, DOM, fetch); return a cleanup fn. Never use it for value derivation — that's `$derived`.

```svelte
$effect(() => {
	const c = new AbortController();
	fetch(`/api/x/${id}`, { signal: c.signal });
	return () => c.abort();
});
```

R5 — Bindable: `let { value = $bindable("") }: { value?: string } = $props();` — required when a parent uses `bind:value` on a custom component.

R6 — Shared/cross-component state lives in `lib/stores/foo.svelte.ts` as `$state`-backed exports. Never legacy `svelte/store`.

```ts
// lib/stores/session.svelte.ts
export const session = $state<{ user: User | null }>({ user: null });
```

R6.5 — Template identifiers must match script scope. The compiler does NOT error on undeclared identifiers (treats them as possibly-global); the failure surfaces only at SSR runtime as `ReferenceError: X is not defined`. Two shapes:

- Shorthand name ≠ local variable: `<Navbar {links} />` when the script has `navLinks` → ReferenceError. `{x}` shorthand is legal ONLY when a script-scope `x` exists; when names differ use `prop={local}` (`links={navLinks}`).
- Refactor removed an import/local but the template still uses it: `<button class={cn(...)}>` after deleting `import { cn }` → ReferenceError. After renaming a local or removing an import, grep the template for identifiers no longer in scope.

`svelte-check` catches both ("No value exists in scope for the shorthand property 'X'") — it runs in `bun run check`; don't ship without it passing (see [[bosia-engineering-discipline]] R6).

R7 — Snippets replace slots. `{#snippet item(i: Item)}<li>{i.label}</li>{/snippet}` then `{@render item(thing)}`. Children: `let { children }: { children: Snippet } = $props();` then `{@render children()}`.

## Anti-patterns

`export let x` · `let x = 0` for reactive · `$: y = x * 2` · `import { writable }` for local state · `$effect` for derivation · `<slot />`.

## Checklist gate

P0:

- [ ] No `export let`; no `$:` reactive statements.
- [ ] Props destructured from `$props()` with inline type.
- [ ] Derivations use `$derived`/`$derived.by`, not `$effect`.
- [ ] No plain `const x = fn(data.*)` / `fn(prop)` — anything read from `data`/props that can change is `$derived` (R3.5).
- [ ] `bind:` targets declare `$bindable`.
- [ ] Every `{shorthand}` and template identifier exists in script scope.

P1:

- [ ] `$effect` returns cleanup when subscribing.
- [ ] Shared state in `.svelte.ts`, not legacy stores.
- [ ] Snippets used instead of slots.
