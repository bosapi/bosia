---
title: Alert Dialog
description: Dialog alert modal yang menyela pengguna dengan konten penting dan mewajibkan respons eksplisit.
demo: AlertDialogDemo
---

```bash
bun x bosia@latest add alert-dialog
```

Dialog modal yang menyela pengguna dengan konten penting dan mengharapkan respons. Berbeda dari Dialog biasa, Alert Dialog memakai `role="alertdialog"` dan **tidak** menutup saat backdrop diklik — pengguna harus memilih aksi secara eksplisit.

## Preview

## Props

### AlertDialog

| Prop   | Type      | Default |
| ------ | --------- | ------- |
| `open` | `boolean` | `false` |

### AlertDialogContent

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

### AlertDialogAction

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

### AlertDialogCancel

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

## Sub-komponen

- `AlertDialog` — penyedia konteks root, mengelola state open
- `AlertDialogTrigger` — tombol yang membuka dialog
- `AlertDialogContent` — overlay tetap + panel dengan focus trap, animasi, tanpa tutup backdrop
- `AlertDialogAction` — tombol yang menutup dialog (styling primary/default)
- `AlertDialogCancel` — tombol yang menutup dialog (styling outline)
- `AlertDialogHeader` — kontainer flex untuk area judul
- `AlertDialogTitle` — `<h2>` ditautkan via `aria-labelledby`
- `AlertDialogDescription` — teks muted ditautkan via `aria-describedby`
- `AlertDialogFooter` — footer dengan layout tombol aksi

## Penggunaan

```svelte
<script lang="ts">
	import {
		AlertDialog,
		AlertDialogTrigger,
		AlertDialogContent,
		AlertDialogHeader,
		AlertDialogTitle,
		AlertDialogDescription,
		AlertDialogFooter,
		AlertDialogAction,
		AlertDialogCancel,
	} from "$lib/components/ui/alert-dialog";
	import { Button } from "$lib/components/ui/button";
</script>

<AlertDialog>
	<AlertDialogTrigger>
		<Button variant="outline">Delete Account</Button>
	</AlertDialogTrigger>
	<AlertDialogContent>
		<AlertDialogHeader>
			<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
			<AlertDialogDescription>
				This action cannot be undone. This will permanently delete your account and remove your data
				from our servers.
			</AlertDialogDescription>
		</AlertDialogHeader>
		<AlertDialogFooter>
			<AlertDialogCancel>Cancel</AlertDialogCancel>
			<AlertDialogAction>Continue</AlertDialogAction>
		</AlertDialogFooter>
	</AlertDialogContent>
</AlertDialog>
```

## State Open Terkontrol

```svelte
<script lang="ts">
	let open = $state(false);
</script>

<AlertDialog bind:open>
	<AlertDialogTrigger>
		<Button>Show Alert</Button>
	</AlertDialogTrigger>
	<AlertDialogContent>
		<AlertDialogHeader>
			<AlertDialogTitle>Confirm Action</AlertDialogTitle>
		</AlertDialogHeader>
		<AlertDialogFooter>
			<AlertDialogCancel>Cancel</AlertDialogCancel>
			<AlertDialogAction>OK</AlertDialogAction>
		</AlertDialogFooter>
	</AlertDialogContent>
</AlertDialog>

<p>Dialog is {open ? "open" : "closed"}</p>
```

## Aksesibilitas

- `role="alertdialog"` dan `aria-modal="true"` pada panel konten
- `aria-labelledby` ditautkan ke `AlertDialogTitle`
- `aria-describedby` ditautkan ke `AlertDialogDescription`
- Fokus terperangkap di dalam dialog (Tab berputar melalui elemen yang bisa difokuskan)
- Fokus kembali ke elemen trigger saat dialog ditutup
- Tombol Escape menutup dialog
- Klik backdrop **tidak** menutup dialog — pengguna harus memilih aksi
- Scroll body terkunci selama terbuka
