---
title: Storefront — Account
description: Sidebar akun, riwayat pesanan dengan detail pelacakan, buku alamat, dan form pengaturan.
demo: StorefrontAccountDemo
---

Area pasca-pembelian. `account-nav` mengganti bagian, `order-list` masuk ke `order-detail`
(dengan stepper pelacakan kiriman), dan `address-book` serta `account-settings` melengkapi profil.
Semuanya tampil mandiri dengan contoh pesanan dan alamat dari `storefront/store`.

## Preview

## Install

```bash
bun x bosia@latest add block storefront/account-nav
bun x bosia@latest add block storefront/order-list
bun x bosia@latest add block storefront/order-detail
bun x bosia@latest add block storefront/address-book
bun x bosia@latest add block storefront/account-settings
```

`order-list`, `order-detail`, dan `address-book` menarik `storefront/store` (yang menyertakan
contoh `orders.ts`); semuanya menarik [`@lucide/svelte`](/components/ui/icon/).

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

`account-nav` mem-bind `active` dan menerima `user`, `items` kustom, dan `onSignOut`. `order-list`
merender `orders` (`{ id, date, status, items, total, eta?, tracking? }`) dan memanggil `onView`.
`order-detail` menampilkan satu `order` plus `address` pengiriman. `address-book` memanggil
`onAdd` / `onEdit` / `onRemove`; `account-settings` menyimpan formnya secara lokal dan memanggil
`onSave` — sambungkan itu ke backend Anda.

## Source

`src/lib/blocks/storefront/{account-nav,order-list,order-detail,address-book,account-settings}/block.svelte`
