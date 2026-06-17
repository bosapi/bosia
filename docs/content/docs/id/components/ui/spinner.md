---
title: Spinner
description: Indikator loading beranimasi.
demo: SpinnerDemo
---

```bash
bun x bosia@latest add spinner
```

Indikator loading beranimasi sederhana. Merender SVG dengan `role="status"` dan `aria-label="Loading"` secara default. Ukuran dan warna dikontrol sepenuhnya melalui kelas utilitas Tailwind.

## Preview

## Props

| Prop         | Type     | Default     |
| ------------ | -------- | ----------- |
| `class`      | `string` | `""`        |
| `aria-label` | `string` | `"Loading"` |
| `role`       | `string` | `"status"`  |

Semua atribut tambahan diteruskan ke `<svg>` root.

## Penggunaan

```svelte
<script lang="ts">
	import { Spinner } from "$lib/components/ui/spinner";
</script>

<Spinner />
```

## Penentuan Ukuran

Kontrol ukuran dengan utilitas Tailwind `size-*`.

```svelte
<Spinner class="size-4" />
<Spinner class="size-6" />
<Spinner class="size-8" />
```

## Warna

Kontrol warna dengan utilitas Tailwind `text-*`. SVG memakai `stroke="currentColor"`.

```svelte
<Spinner class="text-primary" />
<Spinner class="text-destructive" />
<Spinner class="text-muted-foreground" />
```

## Button Loading

Gabungkan dengan `Button` yang dinonaktifkan untuk menampilkan state loading.

```svelte
<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Spinner } from "$lib/components/ui/spinner";
</script>

<Button disabled class="gap-2">
	<Spinner aria-hidden="true" />
	Loading...
</Button>
```

## Aksesibilitas

- Default `role="status"` mengumumkan elemen sebagai live region untuk teknologi bantu.
- Default `aria-label="Loading"` memberi nama aksesibel; timpa untuk konteks lebih spesifik (mis. `aria-label="Saving changes"`).
- Saat spinner berdampingan dengan teks loading yang terlihat (mis. di dalam button), tandai sebagai dekoratif dengan `aria-hidden="true"` untuk mencegah screen reader mengumumkan "Loading" dua kali.
