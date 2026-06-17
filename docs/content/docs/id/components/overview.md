---
title: Ringkasan Komponen
description: Komponen UI salin-tempel dari registry Bosia — gaya shadcn, sepenuhnya milik Anda untuk dikustomisasi.
---

Bosia menyertakan registry komponen — kumpulan komponen UI Svelte 5 yang Anda instal langsung ke proyek Anda. Seperti [shadcn/ui](https://ui.shadcn.com), komponen **disalin ke dalam basis kode Anda**, bukan diimpor dari sebuah paket. Anda memiliki kodenya dan bisa mengkustomisasinya dengan bebas.

## Menginstal Komponen

```bash
bun x bosia@latest add <component...>
```

Ini mengunduh file komponen ke `src/lib/components/ui/<component>/` dan otomatis membuat `src/lib/utils.ts` (helper `cn()`) jika belum ada.

Berikan beberapa nama untuk menginstal beberapa komponen dalam satu panggilan:

```bash
bun x bosia@latest add button card input
```

### Nama Berbasis Path

Gunakan path untuk menginstal komponen di luar direktori `ui/` default:

```bash
bun x bosia@latest add button              # → src/lib/components/ui/button/
bun x bosia@latest add shop/cart           # → src/lib/components/shop/cart/
```

Komponen tanpa `/` default ke prefix `ui/`. Komponen dengan path diinstal ke path persis di bawah `src/lib/components/`.

Dependensi antar komponen diresolusi otomatis. Misalnya, `bun x bosia@latest add data-table` juga menginstal `button`, `input`, dan `separator`.

### Mode Non-interaktif

Berikan `-y` (atau `--yes`) untuk mengonfirmasi otomatis prompt "ganti komponen yang ada?" — berguna untuk pipeline CI dan skrip shell:

```bash
bun x bosia@latest add -y button card
```

### Pengembangan Lokal

Gunakan `--local` untuk menginstal dari registry lokal (berguna saat mengembangkan Bosia itu sendiri):

```bash
bun x bosia@latest add button --local
```

## Memakai Komponen

Impor dari barrel export komponen:

```svelte
<script lang="ts">
	import { Button } from "$lib/components/ui/button";
</script>

<Button variant="outline" size="sm">Click me</Button>
```

## Komponen Tersedia

| Komponen | Deskripsi |
| -------- | --------- |

### UI

| Komponen                                       | Deskripsi                                            |
| ---------------------------------------------- | ---------------------------------------------------- |
| [Avatar](/components/ui/avatar/)               | Avatar gambar dengan fallback                        |
| [Badge](/components/ui/badge/)                 | Label status kecil                                   |
| [Button](/components/ui/button/)               | Button aksesibel dengan varian dan ukuran            |
| [Card](/components/ui/card/)                   | Card komposabel dengan header, konten, footer        |
| [Chart](/components/ui/chart/)                 | Grafik garis dan batang SVG dengan tooltip           |
| [Data Table](/components/ui/data-table/)       | Tabel dengan sorting, filtering, paginasi            |
| [Dropdown Menu](/components/ui/dropdown-menu/) | Dropdown yang dikelola konteks                       |
| [Icons](/components/ui/icon/)                  | Panduan memakai `@lucide/svelte`                     |
| [Input](/components/ui/input/)                 | Input teks bergaya dengan value yang bindable        |
| [Navbar](/components/ui/navbar/)               | Navbar responsif dengan menu mobile dan toggle tema  |
| [Separator](/components/ui/separator/)         | Pembatas horizontal atau vertikal                    |
| [Sidebar](/components/ui/sidebar/)             | Sidebar komposabel dengan mode ikon yang collapsible |

## Kustomisasi

Semua komponen memakai `cn()` untuk penggabungan kelas, jadi Anda bisa memberikan prop `class` untuk menimpa atau memperluas style:

```svelte
<Button class="w-full rounded-full">Full Width Rounded</Button>
```

Komponen memakai token desain Tailwind CSS (`bg-primary`, `text-muted-foreground`, dll.) yang didefinisikan di `app.css` Anda. Sesuaikan tampilan dengan mengedit token tema Anda.

## Utilitas `cn()`

Dibuat otomatis di `src/lib/utils.ts` pada `bosia add` pertama. Ia menggabungkan kelas Tailwind memakai penggabungan kelas bawaan + `tailwind-merge`:

```ts
import { cn } from "$lib/utils";

cn("px-4 py-2", condition && "bg-primary", className);
// → merges and deduplicates classes intelligently
```
