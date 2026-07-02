---
title: Storefront — Account
description: Account sidebar, order history with tracking detail, address book and settings form.
demo: StorefrontAccountDemo
---

The post-purchase area. `account-nav` switches sections, `order-list` drills into `order-detail`
(with a shipment tracking stepper), and `address-book` and `account-settings` round out the
profile. All render standalone with sample orders and addresses from `storefront/store`.

## Preview

## Install

```bash
bun x bosia@latest add block storefront/account-nav
bun x bosia@latest add block storefront/order-list
bun x bosia@latest add block storefront/order-detail
bun x bosia@latest add block storefront/address-book
bun x bosia@latest add block storefront/account-settings
```

`order-list`, `order-detail` and `address-book` pull `storefront/store` (which ships the sample
`orders.ts`); all pull [`@lucide/svelte`](/components/ui/icon/).

## Usage

```svelte
<script lang="ts">
	import AccountNav from "$lib/blocks/storefront/account-nav/block.svelte";
	import OrderList from "$lib/blocks/storefront/order-list/block.svelte";
	import OrderDetail from "$lib/blocks/storefront/order-detail/block.svelte";
	import type { Order } from "$lib/blocks/storefront/store/orders.ts";

	let active = $state("orders");
	let selected = $state<Order | null>(null);
</script>

<AccountNav bind:active />
{#if selected}
	<OrderDetail order={selected} onBack={() => (selected = null)} />
{:else}
	<OrderList onView={(order) => (selected = order)} />
{/if}
```

`account-nav` binds `active` and takes a `user`, custom `items` and `onSignOut`. `order-list`
renders `orders` (`{ id, date, status, items, total, eta?, tracking? }`) and fires `onView`.
`order-detail` shows one `order` plus a shipping `address`. `address-book` fires `onAdd` /
`onEdit` / `onRemove`; `account-settings` keeps its form local and fires `onSave` — wire those to
your backend.

## Source

`src/lib/blocks/storefront/{account-nav,order-list,order-detail,address-book,account-settings}/block.svelte`
