---
title: Drawer
description: Overlay bottom-sheet mobile-first dengan focus trap, scroll lock, dan animasi slide-up.
demo: DrawerDemo
---

```bash
bun x bosia@latest add drawer
```

Sheet yang menempel di bawah dan meluncur naik di atas halaman. Dibuat untuk action sheet mobile, picker, dan alur konfirmasi di mana Dialog yang terpusat terasa salah di layar kecil. Memerangkap fokus, mengunci scroll body, dan menutup saat Escape atau klik backdrop. Sepenuhnya aksesibel dengan `role="dialog"`, `aria-modal`, `aria-labelledby`, dan `aria-describedby`.

## Preview

## Props

### DrawerContent

| Prop                   | Type      | Default |
| ---------------------- | --------- | ------- |
| `closeOnBackdropClick` | `boolean` | `true`  |
| `showHandle`           | `boolean` | `true`  |
| `class`                | `string`  | `""`    |

### Drawer

| Prop   | Type      | Default |
| ------ | --------- | ------- |
| `open` | `boolean` | `false` |

## Sub-komponen

- `Drawer` — penyedia konteks root, mengelola state open
- `DrawerTrigger` — tombol yang membuka drawer
- `DrawerContent` — panel tetap menempel di bawah dengan focus trap dan animasi slide-up
- `DrawerClose` — membungkus elemen apa pun untuk menutup saat diklik
- `DrawerHeader` — kontainer flex untuk area judul
- `DrawerTitle` — `<h2>` ditautkan via `aria-labelledby`
- `DrawerDescription` — teks muted ditautkan via `aria-describedby`
- `DrawerFooter` — footer dengan layout tombol aksi

## Penggunaan

```svelte
<script lang="ts">
	import {
		Drawer,
		DrawerTrigger,
		DrawerContent,
		DrawerHeader,
		DrawerTitle,
		DrawerDescription,
		DrawerFooter,
		DrawerClose,
	} from "$lib/components/ui/drawer";
	import { Button } from "$lib/components/ui/button";
</script>

<Drawer>
	<DrawerTrigger>
		<Button variant="outline">Open Drawer</Button>
	</DrawerTrigger>
	<DrawerContent>
		<DrawerHeader>
			<DrawerTitle>Move Goal</DrawerTitle>
			<DrawerDescription>Set a daily activity target.</DrawerDescription>
		</DrawerHeader>
		<DrawerFooter>
			<Button>Save</Button>
			<DrawerClose>
				<Button variant="outline">Cancel</Button>
			</DrawerClose>
		</DrawerFooter>
	</DrawerContent>
</Drawer>
```

## State Open Terkontrol

```svelte
<script lang="ts">
	let open = $state(false);
</script>

<Drawer bind:open>
	<DrawerTrigger>
		<Button>Open</Button>
	</DrawerTrigger>
	<DrawerContent>
		<DrawerHeader>
			<DrawerTitle>Controlled Drawer</DrawerTitle>
		</DrawerHeader>
		<p>You can control this drawer programmatically.</p>
	</DrawerContent>
</Drawer>

<p>Drawer is {open ? "open" : "closed"}</p>
```

## Sembunyikan Handle Geser

```svelte
<DrawerContent showHandle={false}>
	<!-- No visual handle bar at the top -->
</DrawerContent>
```

## Nonaktifkan Tutup Backdrop

```svelte
<DrawerContent closeOnBackdropClick={false}>
	<!-- Only closes via Escape key or DrawerClose button -->
</DrawerContent>
```

## Kapan Digunakan

- **Drawer** — action sheet mobile, picker, alur konfirmasi. Menempel di bawah, lebar penuh.
- **Dialog** — modal desktop, terpusat, lebar terbatas. Gunakan saat halaman lebar dan aksi tidak terpaut ke tepi bawah.

Pola umum adalah beralih di antara keduanya pada satu breakpoint: Dialog di desktop, Drawer di mobile.

## Aksesibilitas

- `role="dialog"` dan `aria-modal="true"` pada panel konten
- `aria-labelledby` ditautkan ke `DrawerTitle`
- `aria-describedby` ditautkan ke `DrawerDescription`
- Fokus terperangkap di dalam drawer (Tab berputar melalui elemen yang bisa difokuskan)
- Fokus kembali ke elemen trigger saat drawer ditutup
- Tombol Escape menutup drawer
- Scroll body terkunci selama terbuka
- Handle geser bersifat `aria-hidden` (hanya dekoratif — drawer ini tap-to-close)
