---
title: Blocks
description: Composed UI sections (hero, pricing, cards) that bake good design into your app — install one command, no props to wire up.
---

## What blocks are

Primitives (`Button`, `Card`, `Input`) are unstyled toolkit pieces. They give you flexibility but no opinion. **Blocks** are the missing layer on top — composed sections with hardcoded copy, layout, and typography rhythm. Drop one in, then edit the copy in place.

Blocks follow the shadcn philosophy: copy-paste source, no runtime configuration, you own the file.

## Layers

```
Primitives  →  Blocks  →  Pages
(Button)       (FeatureCard)   (Landing)
```

## Install

```bash
bun x bosia@latest add block cards/feature
```

Files land in `src/lib/blocks/<category>/<name>/`. Primitive dependencies (Card, Button, etc.) install automatically.

## Page blocks don't include a navbar

Page-level blocks (heros, cards, sections) don't carry their own site navbar — that's deliberate. The navbar, footer, and sidebar belong in your `+layout.svelte` so they render once across every route. Pair a page block with a [navbar block](/docs/blocks/navbars/standard/) placed in the layout; dropping a hero on a page and a navbar in the layout gives you exactly one navbar, not two.

## Available blocks

150+ blocks across nine categories. Install any with `bun x bosia@latest add block <category>/<name>`.

### Heros (17)

Full-bleed landing hero sections, one per vertical:
[agency](/docs/blocks/heros/agency/) ·
[app](/docs/blocks/heros/app/) ·
[apparel](/docs/blocks/heros/apparel/) ·
[bags](/docs/blocks/heros/bags/) ·
[bookstore](/docs/blocks/heros/bookstore/) ·
[campus](/docs/blocks/heros/campus/) ·
[consulting](/docs/blocks/heros/consulting/) ·
[course](/docs/blocks/heros/course/) ·
[delivery](/docs/blocks/heros/delivery/) ·
[home-goods](/docs/blocks/heros/home-goods/) ·
[lookbook](/docs/blocks/heros/lookbook/) ·
[new-drop](/docs/blocks/heros/new-drop/) ·
[product](/docs/blocks/heros/product/) ·
[restaurant](/docs/blocks/heros/restaurant/) ·
[sale](/docs/blocks/heros/sale/) ·
[shop-split](/docs/blocks/heros/shop-split/) ·
[toys](/docs/blocks/heros/toys/)

### Navbars (19)

- [Standard](/docs/blocks/navbars/standard/) — classic light layouts: centered, split, search-led, minimal, two-tier
- [App & Interactive](/docs/blocks/navbars/app/) — dashboard, e-commerce, docs, mega-menu, announcement, mobile
- [Themes](/docs/blocks/navbars/themes/) — dark, glass, brutalist, floating pill, gradient, brand bar, overlay

### Docks (4)

Mobile [bottom-navigation bars](/docs/blocks/docks/) — edge, floating, pill, center-FAB.

### Footers (12)

- [Standard](/docs/blocks/footers/standard/) — classic light layouts: minimal, columns, newsletter, centered, mega, split-brand
- [Themes](/docs/blocks/footers/themes/) — dark, glass, gradient, brutalist, editorial, terminal

### Sections (21)

Marketing sections for the middle of a page — between the hero and the footer:

- [Pricing](/docs/blocks/pricing/) — columns, comparison, simple
- [Testimonials](/docs/blocks/testimonials/) — grid, spotlight
- [FAQ](/docs/blocks/faq/) — accordion, grid
- [CTA](/docs/blocks/cta/) — banner, panel
- [Features](/docs/blocks/features/) — grid, split, bento
- [Stats](/docs/blocks/stats/) — band, cards, sentiment bar
- [Logos](/docs/blocks/logos/) — row, grid
- [Contact](/docs/blocks/contact/) — split, simple
- [Team](/docs/blocks/team/) — grid, spotlight

### Cards (30)

- [People](/docs/blocks/cards/people/) — profile, contact, testimonial
- [Data & Dashboard](/docs/blocks/cards/data/) — stat, progress, chart, balance
- [Auth & Marketing](/docs/blocks/cards/auth/) — login, feature
- [Media](/docs/blocks/cards/media/) — article, music, video, gallery
- [Commerce](/docs/blocks/cards/commerce/) — product, pricing, order, review
- [Utility & System](/docs/blocks/cards/utility/) — notification, weather, event, file, task, storage, code, map, integration, poll, stepper, chat, pick list

### Storefront (36)

The Mercato commerce blocks:
[Layout](/docs/blocks/storefront/layout/) ·
[Home Sections](/docs/blocks/storefront/home/) ·
[Catalog & Cart](/docs/blocks/storefront/catalog/) ·
[Listing](/docs/blocks/storefront/listing/) ·
[Product](/docs/blocks/storefront/product/) ·
[Cart & Wishlist](/docs/blocks/storefront/cart-wishlist/) ·
[Checkout](/docs/blocks/storefront/checkout/) ·
[Account](/docs/blocks/storefront/account/)

### Auth (9)

Shared [auth blocks](/docs/blocks/auth/) — brand, shell, card, social row, divider, field, password strength, OTP input, form messages.

### Files (3)

[Upload Area](/docs/blocks/files/upload-area/) ·
[Crop Image](/docs/blocks/files/crop-image/) ·
[Image Dialog](/docs/blocks/files/image-dialog/)

## Theming

Blocks consume **semantic tokens only** — `bg-card`, `text-foreground`, `font-display`. Swap themes without touching the block:

```bash
bun x bosia@latest add theme editorial
```

See [Themes](/docs/themes/overview/).
