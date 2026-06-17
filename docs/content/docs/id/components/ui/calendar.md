---
title: Calendar
description: Kalender pemilihan tanggal dengan navigasi bulan/tahun, dukungan keyboard, dan batasan tanggal min/max.
demo: CalendarDemo
---

```bash
bun x bosia@latest add calendar
```

Komponen kalender komposabel untuk pemilihan tanggal tunggal. Dibangun dengan `Date` JS native — tanpa dependensi eksternal.

## Preview

## Props

### Calendar

| Prop           | Type                                     | Default     |
| -------------- | ---------------------------------------- | ----------- |
| `value`        | `Date \| undefined`                      | `undefined` |
| `month`        | `Date \| undefined`                      | `undefined` |
| `min`          | `Date \| undefined`                      | `undefined` |
| `max`          | `Date \| undefined`                      | `undefined` |
| `disabled`     | `((date: Date) => boolean) \| undefined` | `undefined` |
| `weekStartsOn` | `0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6`        | `0`         |
| `fixedWeeks`   | `boolean`                                | `false`     |

- `value` — tanggal terpilih yang bindable
- `month` — bulan tampil terkontrol yang bindable
- `min` / `max` — tanggal paling awal/akhir yang bisa dipilih
- `disabled` — fungsi kustom untuk menonaktifkan tanggal tertentu
- `weekStartsOn` — hari pertama dalam pekan (`0` = Minggu, `1` = Senin, dst.)
- `fixedWeeks` — selalu merender 6 baris (42 sel)

## Sub-komponen

- `Calendar` — wrapper root, menyimpan state dan menyediakan konteks
- `CalendarHeader` — tombol prev/next dengan dropdown `<select>` bulan dan tahun
- `CalendarGrid` — `<table>` dengan header hari-dalam-pekan dan sel tanggal
- `CalendarDay` — tombol hari individual (dipakai internal oleh `CalendarGrid`)

## Penggunaan

```svelte
<script lang="ts">
	import { Calendar, CalendarHeader, CalendarGrid } from "$lib/components/ui/calendar";

	let selected = $state<Date | undefined>(undefined);
</script>

<Calendar bind:value={selected} class="rounded-md border">
	<CalendarHeader />
	<CalendarGrid />
</Calendar>
```

## Bulan Terkontrol

Gunakan `bind:month` untuk mengontrol bulan mana yang ditampilkan:

```svelte
<script lang="ts">
	import { Calendar, CalendarHeader, CalendarGrid } from "$lib/components/ui/calendar";

	let selected = $state<Date | undefined>(undefined);
	let month = $state(new Date(2026, 0, 1)); // January 2026
</script>

<Calendar bind:value={selected} bind:month class="rounded-md border">
	<CalendarHeader />
	<CalendarGrid />
</Calendar>
```

## Batasan Min / Max

```svelte
<Calendar
	bind:value={selected}
	min={new Date(2026, 0, 1)}
	max={new Date(2026, 11, 31)}
	class="rounded-md border"
>
	<CalendarHeader />
	<CalendarGrid />
</Calendar>
```

## Tanggal Nonaktif Kustom

Nonaktifkan akhir pekan:

```svelte
<Calendar
	bind:value={selected}
	disabled={(date) => date.getDay() === 0 || date.getDay() === 6}
	class="rounded-md border"
>
	<CalendarHeader />
	<CalendarGrid />
</Calendar>
```

## Mulai Senin

```svelte
<Calendar bind:value={selected} weekStartsOn={1} class="rounded-md border">
	<CalendarHeader />
	<CalendarGrid />
</Calendar>
```

## Navigasi Keyboard

| Tombol                     | Aksi                                |
| -------------------------- | ----------------------------------- |
| `ArrowLeft` / `ArrowRight` | Hari sebelumnya / berikutnya        |
| `ArrowUp` / `ArrowDown`    | Pekan sebelumnya / berikutnya       |
| `Home` / `End`             | Hari pertama / terakhir dalam pekan |
| `PageUp` / `PageDown`      | Bulan sebelumnya / berikutnya       |
| `Enter` / `Space`          | Pilih hari yang difokuskan          |
