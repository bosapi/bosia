---
title: Section CTA
description: Section call-to-action — banner primary selebar penuh dan panel gelap membulat untuk menjaring email.
demo: CtaSectionsDemo
---

Section call-to-action penutup untuk halaman landing atau marketing. Masing-masing adalah Svelte
`<section>` mandiri selebar penuh yang dibangun **hanya** dari token semantik, sehingga gayanya
berganti di setiap tema — warna brand dipetakan ke `--primary`. Coba pengalih tema di atas preview.

## Preview

## Install

```bash
bun x bosia@latest add block cta/banner
bun x bosia@latest add block cta/panel
```

`banner` menarik [`@lucide/svelte`](/components/ui/icon/) untuk ikonnya.

## Blok-bloknya

- **`banner`** — pita `primary` selebar penuh dengan headline dan sepasang tombol.
- **`panel`** — panel gelap membulat dengan glow primary lembut, input email, dan tombol submit.

## Usage

```svelte
<script lang="ts">
	import Cta from "$lib/blocks/cta/banner/block.svelte";
</script>

<Cta />
```

Sunting headline dan teks di masing-masing `block.svelte`. Form `panel` hanya visual — sambungkan
handler submit-nya ke endpoint newsletter atau signup Anda sendiri.

## Source

`src/lib/blocks/cta/*/block.svelte`
