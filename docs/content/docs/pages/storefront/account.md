---
title: Pages — Storefront Account
description: Account page with order history, tracking detail, address book and settings.
demo: PagesAccountDemo
---

The Mercato account page: a sidebar (avatar, sections, sign out) switching between order history —
click an order for its tracking stepper, items and totals — the address book, and an account
settings form.

## Preview

## Install

```bash
bun x bosia@latest add page storefront/account
```

Installs `page.svelte` plus the storefront blocks it composes.

## Usage

```svelte
<script lang="ts">
	import Account from "$lib/pages/storefront/account/page.svelte";
</script>

<Account />
```

Sections switch client-side — no routing needed. Orders and addresses come from the store's sample
`orders.ts`; pass real data into `order-list`, `order-detail` and `address-book`, and wire
`account-settings`' `onSave` to your backend when you have one.

## Source

`src/lib/pages/storefront/account/page.svelte`
