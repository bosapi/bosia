---
title: Date Picker
description: Pemilih tanggal yang dibangun di atas Popover + Calendar.
demo: DatePickerDemo
---

```bash
bun x bosia@latest add date-picker
```

Wrapper praktis yang mengomposisikan `Popover` + `Calendar` menjadi satu pemilih tanggal. Popover menutup otomatis saat tanggal dipilih. Untuk kontrol penuh, komposisikan `Popover` + `Calendar` langsung.

## Preview

## Props

| Prop             | Type                                     | Default               |
| ---------------- | ---------------------------------------- | --------------------- |
| `value`          | `Date \| undefined` (bindable)           | `undefined`           |
| `placeholder`    | `string`                                 | `"Pick a date"`       |
| `min`            | `Date \| undefined`                      | `undefined`           |
| `max`            | `Date \| undefined`                      | `undefined`           |
| `disabled`       | `((date: Date) => boolean) \| undefined` | `undefined`           |
| `weekStartsOn`   | `0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6`        | `0`                   |
| `fixedWeeks`     | `boolean`                                | `false`               |
| `buttonDisabled` | `boolean`                                | `false`               |
| `formatDate`     | `(date: Date) => string`                 | `toLocaleDateString`  |
| `contentClass`   | `string`                                 | `""`                  |
| `trigger`        | `Snippet<[Date \| undefined]>`           | tombol default        |
| `class`          | `string`                                 | `""` (tombol trigger) |

## Penggunaan

```svelte
<script lang="ts">
	import { DatePicker } from "$lib/components/ui/date-picker";

	let date = $state<Date | undefined>(undefined);
</script>

<DatePicker bind:value={date} />
```

## Dengan Batasan

```svelte
<DatePicker bind:value={date} min={new Date(2026, 0, 1)} max={new Date(2026, 11, 31)} />
```

## Format Kustom

```svelte
<DatePicker bind:value={date} formatDate={(d) => d.toISOString().split("T")[0]} />
```

## Trigger Kustom

Gunakan snippet `trigger` untuk sepenuhnya menyesuaikan konten trigger:

```svelte
<DatePicker bind:value={date}>
	{#snippet trigger(value)}
		<span>{value ? value.toLocaleDateString() : "Choose a date..."}</span>
	{/snippet}
</DatePicker>
```

## Tanggal Nonaktif

Nonaktifkan akhir pekan:

```svelte
<DatePicker bind:value={date} disabled={(d) => d.getDay() === 0 || d.getDay() === 6} />
```

## Perilaku

- Klik trigger untuk membuka popover kalender; klik di luar atau tekan `Escape` untuk menutup.
- Memilih tanggal menutup popover otomatis.
- Semua navigasi keyboard Calendar berfungsi di dalam popover (tombol panah, Home/End, PageUp/PageDown).

## Komposisi

`DatePicker` adalah wrapper tipis. Secara internal ia merender:

```svelte
<Popover>
	<PopoverTrigger>...</PopoverTrigger>
	<PopoverContent class="w-auto p-0">
		<Calendar>
			<CalendarHeader />
			<CalendarGrid />
		</Calendar>
	</PopoverContent>
</Popover>
```

Jika Anda butuh banyak bulan, rentang tanggal, atau layout kalender kustom, komposisikan `Popover` + `Calendar` langsung.
