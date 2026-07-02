---
title: Pages — Storefront Account
description: Halaman akun dengan riwayat pesanan, detail pelacakan, buku alamat, dan pengaturan.
demo: PagesAccountDemo
---

Halaman akun Mercato: sidebar (avatar, bagian, keluar) yang berganti antara riwayat pesanan — klik
sebuah pesanan untuk stepper pelacakan, item, dan totalnya — buku alamat, dan form pengaturan akun.

## Preview

## Install

```bash
bun x bosia@latest add page storefront/account
```

Menginstal `page.svelte` plus block storefront yang disusunnya.

## Usage

```svelte
<script lang="ts">
	import Account from "$lib/pages/storefront/account/page.svelte";
</script>

<Account />
```

Bagian berganti di sisi klien — tanpa routing. Pesanan dan alamat berasal dari contoh `orders.ts`
milik store; kirim data asli ke `order-list`, `order-detail`, dan `address-book`, lalu sambungkan
`onSave` milik `account-settings` ke backend Anda bila sudah ada.

## Source

`src/lib/pages/storefront/account/page.svelte`
