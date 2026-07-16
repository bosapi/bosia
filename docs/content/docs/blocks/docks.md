---
title: Docks — Mobile Bottom Nav
description: Mobile bottom-navigation bars — edge, floating, pill and a center-FAB tab bar.
demo: DocksDemo
---

Bottom navigation bars for mobile and responsive-web surfaces. Each is a self-contained Svelte
`<nav>` built **only** from semantic tokens, so it restyles across every theme — the active tab and
FAB map to `--primary`. Try the theme switcher above the preview.

## Preview

## Install

Each dock installs on its own:

```bash
bun x bosia@latest add block docks/edge
bun x bosia@latest add block docks/floating
bun x bosia@latest add block docks/pill
bun x bosia@latest add block docks/fab
```

Each pulls the [`@lucide/svelte`](/components/ui/icon/) npm package for icons.

## The blocks

- **`edge`** — a full-width flush tab bar with icon labels, a count badge and a dot indicator.
- **`floating`** — the same bar inside a rounded card lifted off the bottom edge.
- **`pill`** — a compact, centered, icon-only capsule.
- **`fab`** — an edge bar split around a raised circular center action button.

## Usage

```svelte
<script lang="ts">
	import Dock from "$lib/blocks/docks/edge/block.svelte";
</script>

<Dock />
```

Drop a dock at the bottom of your mobile layout — pair it with the
[mobile screen shell](/docs/blocks/navbars/app/) for a full app frame. The active tab is a
cosmetic local `$state`; wire the button clicks to your own router and the badge counts to your own
data. Edit the item list in each `block.svelte` to change tabs, icons and labels.

## Source

`src/lib/blocks/docks/*/block.svelte`
