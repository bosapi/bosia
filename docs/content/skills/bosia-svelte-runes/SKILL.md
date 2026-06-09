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

## What it builds

Svelte 5 components that use Runes exclusively. No legacy reactivity, no stores when local state suffices.

## When to use

Any `.svelte` or `.svelte.ts` file. No exceptions.

## Rules

### R1 — State: `$state`

```svelte
<script lang="ts">
	let count = $state(0);
	let user = $state<User | null>(null);
</script>
```

Never `let count = 0` for reactive values. Never stores (`writable`, `readable`) for component-local state.

### R2 — Props: `$props()`

```svelte
<script lang="ts">
	let {
		title,
		items = [],
		onSelect,
	}: { title: string; items?: Item[]; onSelect?: (i: Item) => void } = $props();
</script>
```

Never `export let title`. Type the destructured object inline.

### R3 — Derived: `$derived`

```svelte
<script lang="ts">
	let items = $state<Item[]>([]);
	let count = $derived(items.length);
	let total = $derived.by(() => items.reduce((s, i) => s + i.price, 0));
</script>
```

Never `$: count = items.length`.

### R4 — Effect: `$effect` (sparingly)

```svelte
<script lang="ts">
	let id = $state(0);
	$effect(() => {
		const c = new AbortController();
		fetch(`/api/x/${id}`, { signal: c.signal });
		return () => c.abort();
	});
</script>
```

Use only for side effects (subscriptions, DOM, fetch). For value derivation, use `$derived`. Never call `$effect` for things that should be `$derived`.

### R5 — Bindable props: `$bindable`

```svelte
<script lang="ts">
	let { value = $bindable("") }: { value?: string } = $props();
</script>
```

Required when a parent uses `bind:value` on a custom component.

### R6 — Shared state lives in `.svelte.ts` modules

For cross-component state, create `lib/stores/foo.svelte.ts` and export `$state`-backed values. Do **not** use legacy `svelte/store`.

```ts
// lib/stores/session.svelte.ts
export const session = $state<{ user: User | null }>({ user: null });
```

### R6.5 — Template identifiers must match script scope

Every identifier the template uses (including shorthand attributes `{foo}`) **must** exist in the component's script scope. The Svelte compiler does NOT error on undeclared identifiers — it treats them as possibly-global. The failure surfaces only at SSR runtime as `ReferenceError: X is not defined`.

Two common shapes:

**a) Shorthand attribute name does not match the local variable:**

```svelte
<script lang="ts">
	const navLinks = [
		/* ... */
	];
</script>

<Navbar {links} /> {/* ❌ ReferenceError: links is not defined */}
<Navbar links={navLinks} /> {/* ✅ explicit when names differ */}
<Navbar {navLinks} /> {/* ✅ shorthand only when names match */}
```

Rule: `{x}` shorthand is legal **only** when a script-scope `const/let x` exists with the same name. When names differ, use `prop={local}`.

**b) Refactor removed an import but template still uses it:**

```svelte
<script>
	let label = $state("Submit");
	// removed: import { cn } from "$lib/utils";
</script>

<button class={cn("btn", extra)}>{label}</button> {/* ❌ ReferenceError: cn is not defined */}
<button class="btn">{label}</button> {/* ✅ template synced with script scope */}
```

After renaming a local or removing an import, grep the template for any identifier that no longer exists in script scope.

**Static detection:** `svelte-check` catches both cases (`"No value exists in scope for the shorthand property 'X'"`). It runs as part of `bun run check`. Do not ship without `check` passing — see [[bosia-engineering-discipline]] R6.

❌ Wrong (template doesn't match state setup):

```svelte
<script>
	let label = $state("Submit");
	// removed: import { cn } from "$lib/utils";
</script>

<button class={cn("btn", extra)}>{label}</button> {/* ERROR: cn undefined */}
```

✅ Right (template synced with script scope):

```svelte
<script>
	let label = $state("Submit");
</script>

<button class="btn">{label}</button>
```

After refactoring imports or state setup, search the template for any references that no longer exist and update them to use the new variable.

### R7 — Snippets replace slots

```svelte
{#snippet item(i: Item)}<li>{i.label}</li>{/snippet}
{@render item(thing)}
```

Children: `let { children }: { children: Snippet } = $props();` then `{@render children()}`.

## Anti-patterns

- `export let x` (use `$props()`)
- `let x = 0` for reactive (use `$state`)
- `$: y = x * 2` (use `$derived`)
- `import { writable } from 'svelte/store'` for local state (use `$state` in `.svelte.ts`)
- `$effect` for value derivation (use `$derived`)
- `<slot />` (use snippets + `{@render children()}`)

## Checklist gate

P0:

- [ ] No `export let` anywhere.
- [ ] No `$:` reactive statements.
- [ ] Props destructured from `$props()` with inline type.
- [ ] Derivations use `$derived` / `$derived.by`, not `$effect`.
- [ ] `bind:` targets declare `$bindable`.
- [ ] Every `{shorthand}` and template identifier exists in script scope.

P1:

- [ ] `$effect` returns a cleanup function when subscribing.
- [ ] Shared state in `.svelte.ts` module, not legacy stores.
- [ ] Snippets used instead of slots.
