---
title: Storefront — Layout
description: Sticky header with mega menu, a command-palette search overlay and a multi-column footer.
demo: StorefrontLayoutDemo
---

The frame for every storefront page, plus the search overlay the header's search icon opens. All
are built from semantic tokens only, so they restyle across all 19 themes — pair them with the
`clay` theme for the original Mercato look.

## Preview

## Install

```bash
bun x bosia@latest add block storefront/header
bun x bosia@latest add block storefront/footer
bun x bosia@latest add block storefront/search-overlay
```

The header and search overlay depend on `storefront/store`. All pull
[`@lucide/svelte`](/components/ui/icon/) for icons.

## Usage

```svelte
<script lang="ts">
	import Header from "$lib/blocks/storefront/header/block.svelte";
	import Footer from "$lib/blocks/storefront/footer/block.svelte";
	import SearchOverlay from "$lib/blocks/storefront/search-overlay/block.svelte";
	import { createCart } from "$lib/blocks/storefront/store/store.svelte.ts";

	const cart = createCart();
	let searchOpen = $state(false);
</script>

<Header
	{cart}
	nav={["New In", "Shop", "Collections", "Sale"]}
	onSearch={() => (searchOpen = true)}
/>
<!-- page sections -->
<Footer />
<SearchOverlay bind:open={searchOpen} />
```

`Header` accepts `nav`, `announcements`, an optional shared `cart` (wires the bag and saved counts
and opens the cart drawer) and an `onSearch` callback for the search icon. Pass `cartCount` /
`favCount` directly if you aren't using the store. The mega menu opens on hover over the second nav
item.

`search-overlay` binds `open`, autocompletes over its `products` (name and category) with full
keyboard navigation, shows `popular` chips while the query is empty, and fires `onSelect(product)`
or `onSubmit(query)` for free-text searches.

## Source

`src/lib/blocks/storefront/{header,footer,search-overlay}/block.svelte`
