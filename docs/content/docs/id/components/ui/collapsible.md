---
title: Collapsible
description: Komponen interaktif yang membuka/menutup sebuah panel.
demo: CollapsibleDemo
---

```bash
bun x bosia@latest add collapsible
```

Primitif buka/tutup sederhana. Berbeda dari Accordion, Collapsible mengelola satu state open/closed tanpa koordinasi multi-item atau navigasi tombol panah.

## Preview

## Props Collapsible

| Prop       | Type      | Default |
| ---------- | --------- | ------- |
| `open`     | `boolean` | `false` |
| `disabled` | `boolean` | `false` |
| `class`    | `string`  | `""`    |

`open` bersifat `$bindable()`.

## Props CollapsibleTrigger

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

Merender `<button>` dengan `aria-expanded` dan `aria-controls` yang tersambung otomatis.

## Props CollapsibleContent

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

Dirender secara kondisional saat open. Memiliki `role="region"` dan `aria-labelledby` yang menunjuk ke trigger.

## Penggunaan

```svelte
<script lang="ts">
	import {
		Collapsible,
		CollapsibleTrigger,
		CollapsibleContent,
	} from "$lib/components/ui/collapsible";

	let open = $state(false);
</script>

<Collapsible bind:open>
	<CollapsibleTrigger>Toggle</CollapsibleTrigger>
	<CollapsibleContent>Hidden content revealed on toggle.</CollapsibleContent>
</Collapsible>
```

## Nonaktif

```svelte
<Collapsible disabled>
	<CollapsibleTrigger>Cannot toggle</CollapsibleTrigger>
	<CollapsibleContent>This content is never shown.</CollapsibleContent>
</Collapsible>
```

## Aksesibilitas

| Atribut           | Elemen       | Nilai                        |
| ----------------- | ------------ | ---------------------------- |
| `aria-expanded`   | Trigger      | `true` / `false`             |
| `aria-controls`   | Trigger      | Menunjuk ke `id` konten      |
| `role="region"`   | Content      | Landmark untuk screen reader |
| `aria-labelledby` | Content      | Menunjuk ke `id` trigger     |
| `data-state`      | All          | `"open"` / `"closed"`        |
| `data-disabled`   | Root/Trigger | Ada saat nonaktif            |
