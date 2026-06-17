---
title: Progress
description: Menampilkan indikator yang menunjukkan progres penyelesaian sebuah tugas.
demo: ProgressDemo
---

```bash
bun x bosia@latest add progress
```

Indikator progres linear yang memvisualisasikan penyelesaian tugas. Merender track `<div role="progressbar">` dengan indikator dalam yang transform `translateX`-nya digerakkan oleh rasio `value` / `max`. Sepenuhnya aksesibel via `aria-valuemin`, `aria-valuemax`, dan `aria-valuenow`.

## Preview

## Props

| Prop    | Type             | Default |
| ------- | ---------------- | ------- |
| `value` | `number \| null` | `null`  |
| `max`   | `number`         | `100`   |
| `class` | `string`         | `""`    |

Memberikan `null` (atau menghilangkan `value`) membiarkan `aria-valuenow` tak diset, menandakan state indeterminate. Semua atribut tambahan diteruskan ke `<div>` root.

## Penggunaan

```svelte
<script lang="ts">
	import { Progress } from "$lib/components/ui/progress";
</script>

<Progress value={33} />
```

## Contoh

Animasikan progres seiring pekerjaan selesai dengan memperbarui value `$state` yang reaktif.

```svelte
<script lang="ts">
	import { Progress } from "$lib/components/ui/progress";

	let value = $state(13);

	$effect(() => {
		const timer = setTimeout(() => (value = 66), 500);
		return () => clearTimeout(timer);
	});
</script>

<Progress {value} class="w-[60%]" />
```

Gunakan `max` kustom untuk skala non-persentase.

```svelte
<Progress value={3} max={5} />
```
