---
title: Blocks
description: Bagian UI tersusun (hero, harga, kartu) yang membawa desain bagus ke aplikasi Anda — satu perintah instal, tanpa prop untuk dirangkai.
---

## Apa itu blocks

Primitif (`Button`, `Card`, `Input`) adalah potongan toolkit tanpa gaya. Mereka memberi fleksibilitas tetapi tanpa opini. **Blocks** adalah lapisan yang hilang di atasnya — bagian tersusun dengan teks, tata letak, dan ritme tipografi yang dikode keras. Letakkan satu, lalu sunting teksnya langsung di tempat.

Blocks mengikuti filosofi shadcn: salin-tempel sumber, tanpa konfigurasi runtime, Anda memiliki filenya.

## Lapisan

```
Primitives  →  Blocks  →  Pages
(Button)       (FeatureCard)   (Landing)
```

## Install

```bash
bun x bosia@latest add block cards/feature
```

File mendarat di `src/lib/blocks/<category>/<name>/`. Dependensi primitif (Card, Button, dll.) terinstal otomatis.

## Page block tidak menyertakan navbar

Block tingkat halaman (heros, cards, sections) tidak membawa navbar situsnya sendiri — itu disengaja. Navbar, footer, dan sidebar berada di `+layout.svelte` Anda agar dirender sekali di setiap rute. Pasangkan page block dengan [navbar block](/docs/blocks/navbars/standard/) yang diletakkan di layout; menaruh hero di halaman dan navbar di layout memberi Anda tepat satu navbar, bukan dua.

## Block yang tersedia

150+ block dalam sepuluh kategori. Instal apa pun dengan `bun x bosia@latest add block <category>/<name>`.

### Heros (17)

Section hero landing full-bleed, satu per vertikal:
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

- [Standard](/docs/blocks/navbars/standard/) — layout terang klasik: centered, split, search-led, minimal, two-tier
- [App & Interactive](/docs/blocks/navbars/app/) — dashboard, e-commerce, docs, mega-menu, announcement, mobile
- [Themes](/docs/blocks/navbars/themes/) — dark, glass, brutalist, floating pill, gradient, brand bar, overlay

### Docks (4)

[Bar navigasi bawah](/docs/blocks/docks/) untuk mobile — edge, floating, pill, center-FAB.

### Footers (12)

- [Standard](/docs/blocks/footers/standard/) — layout terang klasik: minimal, columns, newsletter, centered, mega, split-brand
- [Themes](/docs/blocks/footers/themes/) — dark, glass, gradient, brutalist, editorial, terminal

### Sections (21)

Section marketing untuk bagian tengah halaman — di antara hero dan footer:

- [Pricing](/docs/blocks/pricing/) — columns, comparison, simple
- [Testimonials](/docs/blocks/testimonials/) — grid, spotlight
- [FAQ](/docs/blocks/faq/) — accordion, grid
- [CTA](/docs/blocks/cta/) — banner, panel
- [Features](/docs/blocks/features/) — grid, split, bento
- [Stats](/docs/blocks/stats/) — band, cards, sentiment bar
- [Logos](/docs/blocks/logos/) — row, grid
- [Contact](/docs/blocks/contact/) — split, simple
- [Team](/docs/blocks/team/) — grid, spotlight

### Blog (4)

Section editorial untuk situs konten — pasangkan dengan [feature `blog`](/guides/blog/) untuk
post berbasis database di baliknya:

- [Blog](/docs/blocks/blog/) — post-list, post-header, post-body, related

### Cards (30)

- [People](/docs/blocks/cards/people/) — profile, contact, testimonial
- [Data & Dashboard](/docs/blocks/cards/data/) — stat, progress, chart, balance
- [Auth & Marketing](/docs/blocks/cards/auth/) — login, feature
- [Media](/docs/blocks/cards/media/) — article, music, video, gallery
- [Commerce](/docs/blocks/cards/commerce/) — product, pricing, order, review
- [Utility & System](/docs/blocks/cards/utility/) — notification, weather, event, file, task, storage, code, map, integration, poll, stepper, chat, pick list

### Storefront (36)

Block commerce Mercato:
[Layout](/docs/blocks/storefront/layout/) ·
[Home Sections](/docs/blocks/storefront/home/) ·
[Catalog & Cart](/docs/blocks/storefront/catalog/) ·
[Listing](/docs/blocks/storefront/listing/) ·
[Product](/docs/blocks/storefront/product/) ·
[Cart & Wishlist](/docs/blocks/storefront/cart-wishlist/) ·
[Checkout](/docs/blocks/storefront/checkout/) ·
[Account](/docs/blocks/storefront/account/)

### Auth (9)

[Block auth](/docs/blocks/auth/) bersama — brand, shell, card, social row, divider, field, password strength, OTP input, form messages.

### Files (3)

[Upload Area](/docs/blocks/files/upload-area/) ·
[Crop Image](/docs/blocks/files/crop-image/) ·
[Image Dialog](/docs/blocks/files/image-dialog/)

## Theming

Blocks hanya mengonsumsi **token semantik** — `bg-card`, `text-foreground`, `font-display`. Ganti tema tanpa menyentuh block:

```bash
bun x bosia@latest add theme editorial
```

Lihat [Themes](/docs/themes/overview/).
