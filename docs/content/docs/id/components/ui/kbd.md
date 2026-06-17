---
title: Kbd
description: Menampilkan tombol shortcut keyboard dengan gaya keycap. Opsional mengikat shortcut keyboard nyata via onPress.
demo: KbdDemo
---

```bash
bun x bosia@latest add kbd
```

Merender elemen `<kbd>` bergaya yang tampak seperti keycap. Gunakan `KbdGroup` untuk menampilkan kombinasi tombol dengan separator "+".

Berikan `onPress` untuk mengikat shortcut keyboard nyata — tombol otomatis disimpulkan dari konten yang dirender.

## Preview

## Props

### Kbd

| Prop             | Type                         | Default |
| ---------------- | ---------------------------- | ------- |
| `class`          | `string`                     | `""`    |
| `onPress`        | `(e: KeyboardEvent) => void` | —       |
| `preventDefault` | `boolean`                    | `true`  |

### KbdGroup

| Prop             | Type                         | Default |
| ---------------- | ---------------------------- | ------- |
| `class`          | `string`                     | `""`    |
| `onPress`        | `(e: KeyboardEvent) => void` | —       |
| `preventDefault` | `boolean`                    | `true`  |

## Penggunaan

```svelte
<script lang="ts">
	import { Kbd, KbdGroup } from "$lib/components/ui/kbd";
</script>

<Kbd>K</Kbd>

<KbdGroup><Kbd>⌘</Kbd><Kbd>K</Kbd></KbdGroup>

<KbdGroup><Kbd>Ctrl</Kbd><Kbd>Shift</Kbd><Kbd>P</Kbd></KbdGroup>
```

## Shortcut Keyboard

Berikan `onPress` agar komponen mendengarkan kombinasi tombol yang ditampilkan. Tidak perlu prop `keys` eksplisit — tombol disimpulkan dari konten teks `<kbd>` yang dirender.

```svelte
<script lang="ts">
	import { Kbd, KbdGroup } from "$lib/components/ui/kbd";
</script>

<!-- Single key -->
<Kbd onPress={() => console.log("K pressed!")}>K</Kbd>

<!-- Combination — fires when Ctrl+K is pressed -->
<KbdGroup onPress={() => console.log("Ctrl+K!")}>
	<Kbd>Ctrl</Kbd><Kbd>K</Kbd>
</KbdGroup>

<!-- Display only (no listener) -->
<Kbd>Esc</Kbd>
```

Tombol modifier dikenali otomatis: `Ctrl`, `Control`, `Shift`, `Alt`, `Option`, `Meta`, `Cmd`, `⌘`, `Command`, `Win`.

Setel `preventDefault={false}` untuk mengizinkan perilaku default browser pada kombinasi tombol tersebut.

Saat `KbdGroup` punya `onPress`, listener `Kbd` anak otomatis ditekan — hanya shortcut tingkat grup yang menyala.
