---
title: Dialog
description: Overlay dialog modal dengan focus trap, scroll lock, dan markup yang aksesibel.
demo: DialogDemo
---

```bash
bun x bosia@latest add dialog
```

Dialog modal yang melapisi halaman dengan backdrop, memerangkap fokus, mengunci scroll body, dan menutup saat Escape atau klik backdrop. Sepenuhnya aksesibel dengan `role="dialog"`, `aria-modal`, `aria-labelledby`, dan `aria-describedby`.

## Preview

## Props

### DialogContent

| Prop                   | Type      | Default |
| ---------------------- | --------- | ------- |
| `closeOnBackdropClick` | `boolean` | `true`  |
| `class`                | `string`  | `""`    |

### Dialog

| Prop   | Type      | Default |
| ------ | --------- | ------- |
| `open` | `boolean` | `false` |

## Sub-komponen

- `Dialog` — penyedia konteks root, mengelola state open
- `DialogTrigger` — tombol yang membuka dialog
- `DialogContent` — overlay tetap + panel dengan focus trap dan animasi
- `DialogClose` — membungkus elemen apa pun untuk menutup saat diklik
- `DialogHeader` — kontainer flex untuk area judul
- `DialogTitle` — `<h2>` ditautkan via `aria-labelledby`
- `DialogDescription` — teks muted ditautkan via `aria-describedby`
- `DialogFooter` — footer dengan layout tombol aksi

## Penggunaan

```svelte
<script lang="ts">
	import {
		Dialog,
		DialogTrigger,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogDescription,
		DialogFooter,
		DialogClose,
	} from "$lib/components/ui/dialog";
	import { Button } from "$lib/components/ui/button";
</script>

<Dialog>
	<DialogTrigger>
		<Button variant="outline">Open Dialog</Button>
	</DialogTrigger>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Are you sure?</DialogTitle>
			<DialogDescription>This action cannot be undone.</DialogDescription>
		</DialogHeader>
		<DialogFooter>
			<DialogClose>
				<Button variant="outline">Cancel</Button>
			</DialogClose>
			<Button>Confirm</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
```

## State Open Terkontrol

```svelte
<script lang="ts">
	let open = $state(false);
</script>

<Dialog bind:open>
	<DialogTrigger>
		<Button>Open</Button>
	</DialogTrigger>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Controlled Dialog</DialogTitle>
		</DialogHeader>
		<p>You can control this dialog programmatically.</p>
	</DialogContent>
</Dialog>

<p>Dialog is {open ? "open" : "closed"}</p>
```

## Nonaktifkan Tutup Backdrop

```svelte
<DialogContent closeOnBackdropClick={false}>
	<!-- Only closes via Escape key or DialogClose button -->
</DialogContent>
```

## Aksesibilitas

- `role="dialog"` dan `aria-modal="true"` pada panel konten
- `aria-labelledby` ditautkan ke `DialogTitle`
- `aria-describedby` ditautkan ke `DialogDescription`
- Fokus terperangkap di dalam dialog (Tab berputar melalui elemen yang bisa difokuskan)
- Fokus kembali ke elemen trigger saat dialog ditutup
- Tombol Escape menutup dialog
- Scroll body terkunci selama terbuka
