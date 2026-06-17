---
title: Tabs
description: Sekumpulan bagian konten berlapis yang ditampilkan satu per satu.
demo: TabsDemo
---

```bash
bun x bosia@latest add tabs
```

Komponen majemuk untuk beralih antar bagian konten yang saling eksklusif. Dibangun di atas `role="tablist"` / `role="tab"` / `role="tabpanel"` dengan roving tabindex, navigasi tombol panah, dan dukungan `Home`/`End`.

## Preview

## Props Tabs

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `value` | `string` | `""`    |
| `class` | `string` | `""`    |

## Props TabsList

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

## Props TabsTrigger

| Prop       | Type      | Default |
| ---------- | --------- | ------- |
| `value`    | `string`  | —       |
| `disabled` | `boolean` | `false` |
| `class`    | `string`  | `""`    |

## Props TabsContent

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `value` | `string` | —       |
| `class` | `string` | `""`    |

## Penggunaan

```svelte
<script lang="ts">
	import { Tabs, TabsList, TabsTrigger, TabsContent } from "$lib/components/ui/tabs";
	let value = $state("account");
</script>

<Tabs bind:value>
	<TabsList>
		<TabsTrigger value="account">Account</TabsTrigger>
		<TabsTrigger value="password">Password</TabsTrigger>
	</TabsList>
	<TabsContent value="account">Account settings go here.</TabsContent>
	<TabsContent value="password">Password settings go here.</TabsContent>
</Tabs>
```

## Navigasi Keyboard

| Tombol                     | Aksi                              |
| -------------------------- | --------------------------------- |
| `ArrowRight` / `ArrowDown` | Fokus dan aktifkan tab berikutnya |
| `ArrowLeft` / `ArrowUp`    | Fokus dan aktifkan tab sebelumnya |
| `Home`                     | Fokus dan aktifkan tab pertama    |
| `End`                      | Fokus dan aktifkan tab terakhir   |

## Trigger Nonaktif

```svelte
<Tabs value="a">
	<TabsList>
		<TabsTrigger value="a">Active</TabsTrigger>
		<TabsTrigger value="b" disabled>Disabled</TabsTrigger>
	</TabsList>
	<TabsContent value="a">Panel A</TabsContent>
	<TabsContent value="b">Panel B</TabsContent>
</Tabs>
```
