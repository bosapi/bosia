---
name: bosia-storefront
description: Catalog of the Mercato storefront — 4 full pages (home, listing/PLP, product/PDP, checkout) + 24 storefront section blocks + the clay theme. Install pages with `bosia add page storefront/<name>`, blocks with `bosia add block storefront/<name>`. One template, six purposes, restyled by theme via semantic tokens.
triggers:
  - storefront
  - ecommerce
  - e-commerce
  - online store
  - shop page
  - homepage
  - product page
  - product listing
  - PLP
  - PDP
  - category page
  - checkout
  - cart
  - cart drawer
od:
  mode: convention
  category: design
bosia:
  design: true
  requires:
    blocks: []
    themes: [clay]
    components: []
    feats: []
  targets:
    routes: []
  stack: [svelte-5-runes, tailwind-v4]
---

Bosia ships **Mercato** — a multi-purpose storefront: **4 composed pages** assembled from **24
storefront section blocks**, plus the **`clay`** theme. One template renders six store "purposes";
switching the purpose swaps copy + catalogue, switching the theme re-skins it. Everything is built
from semantic tokens, so it restyles across all 19 themes with no edits.

## Install

Pages pull every block + component they need:

```bash
bosia add page storefront/home       # → src/lib/pages/storefront/home/page.svelte
bosia add page storefront/listing
bosia add page storefront/product
bosia add page storefront/checkout
```

Individual sections:

```bash
bosia add block storefront/<name>    # → src/lib/blocks/storefront/<name>/
bosia add theme clay
```

> Registry install rule: **one page or one block per call** — never batch. Each call shells out and
> writes files; big batches blow the streaming window.

## The four pages

| Page       | Install                        | Composes                                                                                                                                |
| ---------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| `home`     | `add page storefront/home`     | header · hero · category-tiles · featured-collection · value-row · promo · editorial · testimonials · newsletter · footer · cart-drawer |
| `listing`  | `add page storefront/listing`  | header · sort-bar · filter-sidebar · product-grid · footer · cart-drawer                                                                |
| `product`  | `add page storefront/product`  | header · gallery · options · trust-row · accordions · related collection · footer · cart-drawer                                         |
| `checkout` | `add page storefront/checkout` | header · checkout-form · order-summary · order-confirmed · footer                                                                       |

## The 24 section blocks (`storefront/*`)

- **Shared:** `store` (runes cart/favs/drawer + sample catalogue + per-purpose seed; a `.svelte.ts` module, not a component)
- **Layout:** `header` (announcement bar + nav + mega menu) · `footer`
- **Home:** `category-tiles` · `value-row` · `promo-banner` · `promo-strip` · `editorial` · `testimonials` · `newsletter`
- **Catalog:** `product-card` · `product-grid` · `featured-collection` · `cart-drawer`
- **Listing:** `filter-sidebar` · `sort-bar`
- **Product:** `product-gallery` · `product-options` · `trust-row` · `pdp-accordions`
- **Checkout:** `checkout-form` · `promo-field` · `order-summary` · `order-confirmed`

## One storefront, six purposes — purpose → theme mapping

Edit one line at the top of any page (`const purpose = purposes.<key>`) and set the paired theme.

| Purpose | Store type         | Theme        |
| ------- | ------------------ | ------------ |
| clay    | General store      | `clay` (new) |
| fashion | Fashion & apparel  | `editorial`  |
| grocery | Grocery & fresh    | `forest`     |
| tech    | Electronics & tech | `paper`      |
| beauty  | Beauty & skincare  | `bloom`      |
| garden  | Plants & garden    | `sage`       |

```ts
import { purposes } from "$lib/blocks/storefront/store/purposes.ts";
const purpose = purposes.fashion; // then: add theme editorial
```

## The shared cart

`createCart()` returns a runes store (`items`, `favs`, `count`, `subtotal`, `open`, `add`, `setQty`,
`toggleFav`). Create **one** per page and pass the same instance to `header`, every `product-grid` /
`featured-collection`, and `cart-drawer` so counts, add-to-bag and the drawer stay in sync. Blocks
without a `cart` fall back to local state so they still render standalone.

```svelte
<script lang="ts">
	import { createCart } from "$lib/blocks/storefront/store/store.svelte.ts";
	const cart = createCart();
</script>

<Header {cart} /> <FeaturedCollection {cart} /> <CartDrawer {cart} />
```

## The golden rule — brand is `primary`, never `accent`

In Bosia `--accent` is a subtle hover background, not the brand. Terracotta / every brand action,
badge, eyebrow and price-sale colour maps to **`primary`** (`bg-primary`, `text-primary`,
`bg-primary/10`). Sale prices and the destructive sale badge use **`destructive`**; rating stars use
`fill-amber-500 text-amber-500`.

## Token rules (semantic tokens only — never hex)

| Role                       | Utility                                                                  |
| -------------------------- | ------------------------------------------------------------------------ |
| Page / card                | `bg-background` / `bg-card text-card-foreground`                         |
| Dark / ink section         | `bg-foreground text-background` (header announce, footer, promo-strip)   |
| Foreground / muted / faint | `text-foreground` / `text-muted-foreground` / `text-muted-foreground/70` |
| Brand                      | `bg-primary` / `text-primary` / `text-primary-foreground`                |
| Soft brand tint / wash     | `bg-primary/10` / `bg-muted/40`                                          |
| Sale                       | `bg-destructive text-destructive-foreground` / `text-destructive`        |
| Border / strong border     | `border-border` / `border-input`                                         |
| Type                       | headings `font-display`, body `font-body`, fine print `font-mono`        |

## Mercato voice (preserve when editing copy)

- Sentence case everywhere **except** the tracked-uppercase eyebrow (`uppercase tracking-[0.14em]`).
- Speak as "we" to "you"; modest, concrete claims; **no emoji**.
- Prices via `money()` from the store (whole numbers drop the cents).

## Anti-patterns

- ❌ Hardcoded hex / `bg-orange-*` for the brand → use `bg-primary`.
- ❌ Separate carts per block → one `createCart()` shared down the page.
- ❌ Brand on `accent` → it won't follow the theme.
- ❌ Title Case or emoji in copy → sentence case, no emoji.
- ❌ Hand-rolling a product card → install `storefront/product-card`.

## Backend

This skill is the **customer-facing UI only** — no backend. For data, auth and orders, pair with the
shop template scaffold (`bosia create my-shop --template shop`). See [[bosia-shop-template]] — no
overlap: that scaffolds the server, this composes the storefront.
