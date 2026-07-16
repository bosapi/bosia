---
name: bosia-docks
description: Catalog of 4 mobile bottom-nav (dock) blocks — edge, floating, pill, fab. Install with `bosia add block docks/<name>`; self-contained `<nav>` tab bars that restyle across all 19 themes via semantic tokens.
triggers:
  - dock
  - bottom nav
  - bottom navigation
  - tab bar
  - mobile nav
  - bottom bar
od:
  mode: convention
  category: design
bosia:
  design: true
  requires:
    blocks: []
    themes: []
    components: []
    feats: []
  targets:
    routes: []
  stack: [svelte-5-runes, tailwind-v4]
---

Bosia ships **4 dock blocks** — mobile bottom-navigation bars ported from the Dockline design
system. Each is a self-contained Svelte 5 `<nav>` built **only** from semantic tokens, so it
restyles across all 19 themes with no edits. Install individually:

```bash
bosia add block docks/<name>
```

Files land at `src/lib/blocks/docks/<name>/block.svelte`. Each pulls the
[`@lucide/svelte`](/components/ui/icon/) npm package for icons.

This is the bottom counterpart to [[bosia-navbars]] (top bars). Drop a dock at the bottom of a
mobile layout; pairs naturally with [[bosia-mobile-screen]] for a full app frame.

## The golden rule — brand is `primary`, never `accent`

In Bosia, `--accent` is a **subtle hover background**, not the brand colour. The active tab and the
center FAB are the brand action — paint them with `primary`:

- Active tab → `text-primary` behind a soft `bg-primary/10` pill; inactive → `text-muted-foreground`.
- FAB → `bg-primary text-primary-foreground`.
- Count badge → `bg-destructive text-destructive-foreground`; dot indicator → `bg-primary`.
- Never paint an active/brand element with `accent` — it won't follow the theme.

## Catalog

- **`edge`** — full-width flush tab bar with icon labels, a count badge and a dot indicator.
- **`floating`** — the same bar inside a rounded card lifted off the bottom edge (`shadow-lg`).
- **`pill`** — a compact, centered, icon-only capsule.
- **`fab`** — an edge bar split left/right around a raised circular center action button.

All live on one page with previews and install lines:
[Docks](/docs/blocks/docks/) — under **Blocks → Docks** in the sidebar.

## Usage

```svelte
<script lang="ts">
	import Dock from "$lib/blocks/docks/edge/block.svelte";
</script>

<Dock />
```

Each bar is `max-w-[390px] mx-auto` and keeps 44px hit targets (`min-h-11 min-w-14`). The active tab
is a cosmetic local `$state` — wire the button clicks to your own router and the badge counts to
your own data. Edit the `items` array in each `block.svelte` to change tabs, icons and labels.

## Icons

Use `@lucide/svelte` (the scoped package, never `lucide-svelte`). Docks use `Home`, `Search`,
`Heart`, `Bell`, `User`, `Plus`. Import each icon directly — never destructure-rename a Lucide icon
in a registry block; for the per-item dynamic icon, alias with a plain `{@const Icon = item.icon}`.
