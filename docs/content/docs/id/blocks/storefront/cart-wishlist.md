---
title: Storefront — Cart & Wishlist
description: Baris item keranjang lebar penuh, grid wishlist untuk favorit, dan empty state bersama.
demo: StorefrontCartWishlistDemo
---

Bagian-bagian halaman keranjang khusus dan wishlist. `cart-lines` merender tas sebagai baris lebar
penuh, `wishlist-grid` adalah UI pertama untuk favorit toko, dan keduanya jatuh ke `empty-state`
bersama saat tidak ada yang ditampilkan.

## Preview

## Install

```bash
bun x bosia@latest add block storefront/empty-state
bun x bosia@latest add block storefront/cart-lines
bun x bosia@latest add block storefront/wishlist-grid
```

`cart-lines` dan `wishlist-grid` menarik `storefront/store` dan `storefront/empty-state`; semuanya
menarik [`@lucide/svelte`](/components/ui/icon/).

## Usage

```svelte
<script lang="ts">
	import CartLines from "$lib/blocks/storefront/cart-lines/block.svelte";
	import WishlistGrid from "$lib/blocks/storefront/wishlist-grid/block.svelte";
	import { createCart } from "$lib/blocks/storefront/store/store.svelte.ts";

	const cart = createCart();
</script>

<CartLines {cart} />
<WishlistGrid {cart} />
```

`cart-lines` menyunting cart bersama secara langsung — stepper memanggil `setQty`, hapus mengatur
kuantitas ke nol — dan menampilkan empty state (dengan CTA `onContinue`) saat tas kosong.
`wishlist-grid` memfilter `products`-nya berdasarkan favorit cart; "Move to bag" menambah item dan
menghapus favoritnya (`onMoveToCart` dipanggil setelahnya). `empty-state` menerima `icon`, `title`,
`sub`, `cta`, dan `onCta` untuk pemakaian mandiri.

## Source

`src/lib/blocks/storefront/{empty-state,cart-lines,wishlist-grid}/block.svelte`
