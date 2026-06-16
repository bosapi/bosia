---
title: Navbars — App & Interactive
description: App-shell and interactive navbars — dashboard, e-commerce, docs, mega-menu, announcement and mobile.
demo: NavbarsAppDemo
---

Navbars for product UIs, with a few interactive specimens. Each is a self-contained, full-width
Svelte `<header>` built **only** from semantic tokens, so it restyles across every theme — the
brand colour maps to `--primary`. Try the theme switcher above the preview.

## Preview

## Install

Each navbar installs on its own:

```bash
bun x bosia@latest add block navbars/dashboard
bun x bosia@latest add block navbars/ecommerce
bun x bosia@latest add block navbars/docs
bun x bosia@latest add block navbars/mega-menu
bun x bosia@latest add block navbars/announcement
bun x bosia@latest add block navbars/mobile
```

Each pulls the [`@lucide/svelte`](/components/ui/icon/) npm package for icons.

## The blocks

- **`dashboard`** — breadcrumb, search, action icons with badges and an avatar.
- **`ecommerce`** — category links, product search, wishlist, account and cart.
- **`docs`** — version pill, search, links, a light/dark toggle and a repo link.
- **`mega-menu`** — a catalog link opens a three-column dropdown panel.
- **`announcement`** — a dismissible promo strip above the main nav row.
- **`mobile`** — a hamburger toggles a full overlay menu with stacked links.

## Usage

```svelte
<script lang="ts">
	import MegaMenu from "$lib/blocks/navbars/mega-menu/block.svelte";
</script>

<MegaMenu />
```

The toggles (theme switch, mega-menu, announcement dismiss, mobile menu) are cosmetic local
`$state` — wire them to your own data and handlers. Edit `block.svelte` to swap the wordmark and
copy.

## Source

`src/lib/blocks/navbars/*/block.svelte`
