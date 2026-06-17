---
title: Files — Image Dialog
description: Dialog pemilih multi-gambar — tab Upload, tab External URL, dan galeri gambar yang sudah ada. Mengembalikan string[] berisi URL saat dikonfirmasi.
demo: FilesImageDialogDemo
---

```bash
bun x bosia@latest add block files/image-dialog
```

Dialog modal yang menyatukan tiga jalur input yang sebenarnya dipakai pengguna saat memilih gambar: **upload** seret-dan-lepas, tempel **URL eksternal**, dan pilih ulang dari **galeri yang ada** (entitas saat ini + pustaka penuh pengguna yang masuk). Mengembalikan keseluruhan array URL yang dimaksud saat Confirm sehingga pemanggil dapat mengganti field induk secara atomik.

## Preview

## Install

```bash
bun x bosia@latest add block files/image-dialog
```

Menarik `ui/button`, `ui/dialog`, `ui/input`, `ui/label`, `ui/sonner`, `ui/tabs`, block [`files/upload-area`](/docs/blocks/files/upload-area/), dan paket npm [`@lucide/svelte`](/components/ui/icon/). Block ini menggunakan kembali rute [fitur `file-upload`](/docs/guides/file-upload) (`POST /api/files`, `GET /api/files`) — instal itu lebih dulu.

## Usage

```svelte
<script lang="ts">
	import ImageDialog from "$lib/blocks/files/image-dialog/block.svelte";

	let open = $state(false);
	let gallery = $state<string[]>(["https://images.unsplash.com/photo-1517694712202-14dd9538aa97"]);

	async function save(urls: string[]) {
		await fetch(`/api/posts/${post.id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ images: urls }),
		});
		gallery = urls;
		open = false;
	}
</script>

<button onclick={() => (open = true)}>Edit images</button>

<ImageDialog
	bind:open
	existingImages={gallery}
	max={10}
	onConfirm={save}
	onCancel={() => (open = false)}
/>
```

Dialog **tidak** menutup otomatis saat Confirm — biarkan pilihan tetap terlihat selagi Anda menyimpan, lalu set `open = false` setelah penyimpanan selesai agar kegagalan tetap mempertahankan pemilih terpasang.

Saat dialog terbuka, `existingImages` **terpilih lebih dulu** sehingga Confirm tanpa interaksi lebih lanjut tidak melakukan apa-apa. Mengunggah atau menambahkan URL **menambahkan** ke pilihan; mengeklik thumbnail yang ada menonaktifkannya (penghapusan). `onConfirm` selalu terpicu dengan keseluruhan set yang dimaksud — pemanggil melakukan penggantian atomik.

## Props

| Prop             | Type                        | Default                                             | Description                                                                                                   |
| ---------------- | --------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `open`           | `boolean`                   | `false`                                             | Bindable. Apakah dialog ditampilkan.                                                                          |
| `existingImages` | `string[]`                  | `[]`                                                | Entri yang sudah terlampir. Bisa `http(s)://`, `/uploads/...`, atau id polos (butuh `resolveUrl`).            |
| `resolveUrl`     | `(entry: string) => string` | Lolos-langsung berbentuk URL, melempar pada id      | Ubah entri `existingImages` menjadi URL yang dapat dirender. Default melempar jika entri belum berbentuk URL. |
| `max`            | `number`                    | `Infinity`                                          | Maks yang dapat dipilih. Menambah melewati batas memunculkan toast.                                           |
| `title`          | `string`                    | `"Select images"`                                   | Judul dialog.                                                                                                 |
| `description`    | `string`                    | `"Upload, paste a URL, or pick from your library."` | Deskripsi dialog di bawah judul.                                                                              |
| `accept`         | `string`                    | `"image/*"`                                         | Diteruskan ke `UploadArea` di dalamnya.                                                                       |
| `maxSizeMB`      | `number`                    | `10`                                                | Diteruskan ke `UploadArea` di dalamnya.                                                                       |
| `enableCrop`     | `boolean`                   | `false`                                             | Diteruskan ke `UploadArea` di dalamnya.                                                                       |
| `onConfirm`      | `(urls: string[]) => void`  | —                                                   | Terpicu saat Confirm dengan keseluruhan set yang dimaksud. **Tidak** menutup dialog otomatis.                 |
| `onCancel`       | `() => void`                | —                                                   | Terpicu saat Cancel; dialog menutup sendiri.                                                                  |

## Tiga jalur input

- **Tab Upload** — menyematkan [`UploadArea`](/docs/blocks/files/upload-area/) yang diarahkan ke `/api/files`. Saat berhasil, `record.url` didorong ke dalam pilihan.
- **Tab External URL** — hanya `http(s)://` yang divalidasi klien. Lolos-langsung ke entitas induk — tidak ada ingest backend. Jika host jarak jauh merotasi gambarnya, field induk merujuk URL mati.
- **Galeri yang ada** — baris atas menampilkan `existingImages` lewat `resolveUrl()` (terpilih lebih dulu saat dibuka; klik untuk menghapus). Di bawahnya, pustaka penuh pengguna yang masuk diambil sekali saat mount dari `GET /api/files`. Tiap thumbnail adalah toggle multi-pilih.

## Menyimpan URL vs id

Block mengembalikan URL (`record.url`), tidak pernah id. Jika lapisan persistensi Anda menyimpan id, petakan URL → id saat menyimpan di induk — jaga kontrak dialog tetap khusus URL. Jika kolom Anda yang ada menyimpan id, sediakan resolver eksplisit:

```svelte
<ImageDialog
	existingImages={post.gallery}
	resolveUrl={(id) => `/uploads/${idToKey(id)}`}
	onConfirm={save}
	bind:open
/>
```

Resolver default mengembalikan entri berbentuk URL apa adanya dan **melempar** pada id polos — gagal dengan keras lebih baik daripada diam-diam merender thumbnail rusak.

## Komposabilitas

`image-dialog` menggunakan kembali `upload-area`, tetapi untuk alur gambar tunggal (avatar, sampul tunggal) Anda sebaiknya memasang `upload-area` langsung — modal bertab adalah gesekan tanpa imbalan pada skala itu. Lihat [Upload Area](/docs/blocks/files/upload-area/) untuk primitif yang lebih ramping.

## Source

`src/lib/blocks/files/image-dialog/block.svelte`
