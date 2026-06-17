---
title: Sonner
description: Komponen notifikasi toast yang opinionated tanpa dependensi.
demo: SonnerDemo
---

```bash
bun x bosia@latest add sonner
```

Komponen notifikasi toast tanpa dependensi. Menyediakan varian toast success, error, info, warning, dan default dengan styling kompatibel-shadcn.

## Preview

## Setup

Tambahkan komponen `<Toaster />` ke root layout Anda agar toast bisa dirender dari mana saja di aplikasi Anda:

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import { Toaster } from "$lib/components/ui/sonner";
</script>

<Toaster />

{@render children()}
```

## Props

### Toaster

| Prop       | Type                                                                                                        | Default          |
| ---------- | ----------------------------------------------------------------------------------------------------------- | ---------------- |
| `position` | `"top-left"` \| `"top-right"` \| `"bottom-left"` \| `"bottom-right"` \| `"top-center"` \| `"bottom-center"` | `"bottom-right"` |
| `class`    | `string`                                                                                                    | `""`             |

## Penggunaan

```svelte
<script lang="ts">
	import { toast } from "$lib/components/ui/sonner";
</script>

<button onclick={() => toast("Hello world!")}> Show Toast </button>
```

## Varian

```svelte
<script lang="ts">
	import { toast } from "$lib/components/ui/sonner";
</script>

<button onclick={() => toast("Default toast")}>Default</button>
<button onclick={() => toast.success("Success!")}>Success</button>
<button onclick={() => toast.error("Something went wrong")}>Error</button>
<button onclick={() => toast.info("FYI")}>Info</button>
<button onclick={() => toast.warning("Be careful")}>Warning</button>
```

## Dengan Deskripsi

```svelte
<button
	onclick={() =>
		toast("Event created", {
			description: "Monday, January 3rd at 6:00pm",
		})}
>
	Show Toast
</button>
```

## Menutup Secara Programatik

```svelte
<script lang="ts">
	import { toast } from "$lib/components/ui/sonner";

	const id = toast("Processing...");
	// Later:
	toast.dismiss(id);
</script>
```
