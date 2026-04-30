---
title: Styling
description: Tailwind CSS v4 bawaan dengan design token terinspirasi shadcn dan dark mode.
---

## Tailwind CSS v4

Tailwind CSS v4 sudah terintegrasi dalam Bosia — tidak perlu instalasi atau konfigurasi tambahan. Dikompilasi saat build time oleh `@tailwindcss/cli`.

Gaya global Anda berada di `src/app.css`:

```css
@import "tailwindcss";

@theme {
	--color-background: oklch(1 0 0);
	--color-foreground: oklch(0.145 0 0);
	--color-primary: oklch(0.205 0.064 286.3);
	--color-primary-foreground: oklch(0.985 0 0);
	/* ... more tokens */
}
```

## Design Tokens

Template bawaan menyertakan **token semantik terinspirasi shadcn** untuk sistem desain yang konsisten:

| Token         | Kegunaan                       |
| ------------- | ------------------------------ |
| `background`  | Latar belakang halaman         |
| `foreground`  | Warna teks bawaan              |
| `primary`     | Tombol, tautan, aksen          |
| `secondary`   | Aksi sekunder                  |
| `muted`       | Latar belakang halus, nonaktif |
| `accent`      | Status hover, sorotan          |
| `destructive` | Tombol hapus, error            |
| `card`        | Latar belakang kartu           |
| `border`      | Warna border                   |
| `input`       | Border input                   |
| `ring`        | Cincin fokus                   |

Gunakan dengan kelas Tailwind:

```svelte
<div class="bg-background text-foreground">
	<button class="bg-primary text-primary-foreground rounded-md px-4 py-2"> Click me </button>
	<p class="text-muted-foreground">Subtle text</p>
</div>
```

## Dark Mode

Dark mode diaktifkan dengan menambahkan kelas `.dark` pada elemen induk. Semua design token memiliki varian dark mode yang didefinisikan di `app.css`:

```css
.dark {
	--color-background: oklch(0.145 0 0);
	--color-foreground: oklch(0.985 0 0);
	/* ... dark variants */
}
```

Aktifkan di layout Anda:

```svelte
<script>
	let dark = $state(false);
</script>

<div class={dark ? "dark" : ""}>
	<button onclick={() => (dark = !dark)}>Toggle theme</button>
	<slot />
</div>
```

## Utilitas cn()

Fungsi `cn()` menggunakan penggabungan class bawaan dan [tailwind-merge](https://github.com/dcastil/tailwind-merge) untuk menggabungkan kelas Tailwind secara aman:

```ts
import { cn } from "$lib/utils";
// or: import { cn } from "bosia";

cn("px-4 py-2", "px-6");
// → "py-2 px-6" (px-4 removed, px-6 wins)

cn("text-red-500", isActive && "text-blue-500", className);
// → conditionally applies classes, merges conflicts
```

Ini sangat berguna saat membangun komponen yang dapat digunakan kembali yang menerima prop `class`:

```svelte
<script lang="ts">
	import { cn } from "$lib/utils";
	let { class: className, ...props } = $props();
</script>

<button class={cn("bg-primary text-white rounded px-4 py-2", className)} {...props}>
	<slot />
</button>
```
