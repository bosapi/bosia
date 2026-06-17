---
title: Range Calendar
description: Kalender pemilihan rentang tanggal dengan pemilihan mulai/akhir, preview hover, dan navigasi keyboard.
demo: RangeCalendarDemo
---

```bash
bun x bosia@latest add range-calendar
```

Kalender komposabel untuk memilih rentang tanggal. Dibangun di atas komponen `calendar` — memakai ulang `CalendarHeader` untuk navigasi. `Date` JS native, tanpa dependensi eksternal.

## Preview

## Props

### RangeCalendar

| Prop           | Type                                     | Default                                |
| -------------- | ---------------------------------------- | -------------------------------------- |
| `value`        | `{ start?: Date; end?: Date }`           | `{ start: undefined, end: undefined }` |
| `month`        | `Date \| undefined`                      | `undefined`                            |
| `min`          | `Date \| undefined`                      | `undefined`                            |
| `max`          | `Date \| undefined`                      | `undefined`                            |
| `disabled`     | `((date: Date) => boolean) \| undefined` | `undefined`                            |
| `weekStartsOn` | `0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6`        | `0`                                    |
| `fixedWeeks`   | `boolean`                                | `false`                                |

- `value` — objek rentang bindable dengan tanggal `start` dan `end`
- `month` — bulan tampil terkontrol yang bindable
- `min` / `max` — tanggal paling awal/akhir yang bisa dipilih
- `disabled` — fungsi kustom untuk menonaktifkan tanggal tertentu
- `weekStartsOn` — hari pertama dalam pekan (`0` = Minggu, `1` = Senin, dst.)
- `fixedWeeks` — selalu merender 6 baris (42 sel)

## Sub-komponen

- `RangeCalendar` — wrapper root, menyimpan state rentang dan menyediakan konteks ganda
- `RangeCalendarHeader` — `CalendarHeader` yang di-re-export dengan prev/next dan select bulan/tahun
- `RangeCalendarGrid` — `<table>` dengan header hari-dalam-pekan dan sel tanggal sadar-rentang
- `RangeCalendarDay` — tombol hari individual dengan styling rentang (dipakai internal oleh `RangeCalendarGrid`)

## Perilaku Pemilihan

1. **Klik** — menyetel tanggal mulai
2. **Klik lagi** (pada atau setelah mulai) — menyetel tanggal akhir
3. **Klik sebelum mulai** — mereset dan menyetel mulai baru
4. **Klik saat keduanya terset** — mereset rentang, menyetel mulai baru

Selama memilih (mulai terset, belum ada akhir), hover menampilkan **rentang preview** dengan styling lebih terang.

## Penggunaan

```svelte
<script lang="ts">
	import { RangeCalendar, RangeCalendarGrid } from "$lib/components/ui/range-calendar";
	import { CalendarHeader } from "$lib/components/ui/calendar";

	let value = $state<{ start?: Date; end?: Date }>({ start: undefined, end: undefined });
</script>

<RangeCalendar bind:value class="rounded-md border">
	<CalendarHeader />
	<RangeCalendarGrid />
</RangeCalendar>
```

## Batasan Min / Max

```svelte
<RangeCalendar
	bind:value
	min={new Date(2026, 0, 1)}
	max={new Date(2026, 11, 31)}
	class="rounded-md border"
>
	<CalendarHeader />
	<RangeCalendarGrid />
</RangeCalendar>
```

## Nonaktifkan Akhir Pekan

```svelte
<RangeCalendar
	bind:value
	disabled={(date) => date.getDay() === 0 || date.getDay() === 6}
	class="rounded-md border"
>
	<CalendarHeader />
	<RangeCalendarGrid />
</RangeCalendar>
```

## Navigasi Keyboard

| Tombol                     | Aksi                                |
| -------------------------- | ----------------------------------- |
| `ArrowLeft` / `ArrowRight` | Hari sebelumnya / berikutnya        |
| `ArrowUp` / `ArrowDown`    | Pekan sebelumnya / berikutnya       |
| `Home` / `End`             | Hari pertama / terakhir dalam pekan |
| `PageUp` / `PageDown`      | Bulan sebelumnya / berikutnya       |
| `Enter` / `Space`          | Pilih hari yang difokuskan          |
