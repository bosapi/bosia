---
title: Storefront — Layout
description: Sticky header with mega menu and a multi-column footer for the Mercato storefront.
demo: StorefrontLayoutDemo
---

The frame for every storefront page. Both are built from semantic tokens only, so they restyle
across all 19 themes — pair them with the `clay` theme for the original Mercato look.

## Preview

## Install

```bash
bun x bosia@latest add block storefront/header
bun x bosia@latest add block storefront/footer
```

The header depends on `storefront/store` for the shared cart type. Both pull
[`@lucide/svelte`](/components/ui/icon/) for icons.

## Usage

```svelte
<script lang="ts">
	import Header from "$lib/blocks/storefront/header/block.svelte";
	import Footer from "$lib/blocks/storefront/footer/block.svelte";
	import { createCart } from "$lib/blocks/storefront/store/store.svelte.ts";

	const cart = createCart();
</script>

<Header {cart} nav={["New In", "Shop", "Collections", "Sale"]} />
<!-- page sections -->
<Footer />
```

`Header` accepts `nav`, `announcements`, and an optional shared `cart` (wires the bag and saved
counts and opens the cart drawer). Pass `cartCount` / `favCount` directly if you aren't using the
store. The mega menu opens on hover over the second nav item.

## Source

`src/lib/blocks/storefront/header/block.svelte` · `src/lib/blocks/storefront/footer/block.svelte`
