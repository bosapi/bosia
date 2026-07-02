---
title: Pages — Overview
description: Full, composed pages installed as one command — a group of blocks, no backend.
---

A **page** is the next tier up from a block: a complete, ready-to-wire screen composed from
storefront blocks, with no backend of its own. Install one and you get the `page.svelte` plus every
block and component it depends on:

```bash
bun x bosia@latest add page storefront/home
```

```
src/lib/pages/storefront/home/page.svelte   ← the composed page
src/lib/blocks/storefront/*                  ← its sections (installed for you)
```

You own the routing. Drop the page into a route and render it:

```svelte
<script lang="ts">
	import Home from "$lib/pages/storefront/home/page.svelte";
</script>

<Home />
```

## The Mercato storefront

The six storefront pages are one multi-purpose template — **Mercato**. The same blocks render any
of six store "purposes"; switching the purpose swaps the copy and catalogue, and switching the
theme re-skins it. Edit one line at the top of any page:

```ts
import { purposes } from "$lib/blocks/storefront/store/purposes.ts";
const purpose = purposes.fashion; // clay · fashion · grocery · tech · beauty · garden
```

### Purpose → theme mapping

Each purpose pairs with an existing Bosia theme. Set the theme on the app (or any wrapper) the way
you normally do; the storefront uses semantic tokens, so it follows along.

| Purpose | Store type         | Theme                            |
| ------- | ------------------ | -------------------------------- |
| clay    | General store      | [`clay`](/themes/clay) _(new)_   |
| fashion | Fashion & apparel  | [`editorial`](/themes/editorial) |
| grocery | Grocery & fresh    | [`forest`](/themes/forest)       |
| tech    | Electronics & tech | [`paper`](/themes/paper)         |
| beauty  | Beauty & skincare  | [`bloom`](/themes/bloom)         |
| garden  | Plants & garden    | [`sage`](/themes/sage)           |

## The pages

- [Home](/pages/storefront/home) — hero, categories, featured collection, editorial, more
- [Listing](/pages/storefront/listing) — filters, sort and a product grid (PLP)
- [Product](/pages/storefront/product) — gallery, buy box, trust, details and reviews (PDP)
- [Cart](/pages/storefront/cart) — line items, quantity steppers, summary and empty state
- [Wishlist](/pages/storefront/wishlist) — favourited products with move-to-bag
- [Checkout](/pages/storefront/checkout) — multi-step form, summary and confirmation

For the customer-facing UI here plus a backend, pair with the shop template scaffold
(`bun x bosia@latest create my-shop --template shop`).

## The auth pages

A second family — six login/auth screens composed from shared [auth blocks](/blocks/auth). Each
defaults to a centered card and switches to a split brand/photo panel with one prop
(`variant="split"`). Install one and you get the `page.svelte` plus every auth block it composes:

```bash
bun x bosia@latest add page auth/login
```

- [Login](/pages/auth/login) — social row, email + password, remember me
- [Register](/pages/auth/register) — social grid, name/email/password, strength meter
- [Forgot Password](/pages/auth/forgot) — email field, reset-link note
- [Magic Link](/pages/auth/magic-link) — check-your-inbox confirmation
- [OTP / 2FA](/pages/auth/otp) — segmented 6-digit code input
- [SSO](/pages/auth/sso) — enterprise work email / domain

These are the visual layer only — no sessions or password hashing. For real authentication, pair
them with the `bosia-auth-flow` server wiring.
