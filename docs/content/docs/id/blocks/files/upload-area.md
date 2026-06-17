---
title: Files — Upload Area
description: Area unggah file seret-dan-lepas dengan preview, validasi ukuran, bilah progres, dan hook crop opsional.
demo: FilesUploadCropDemo
---

```bash
bun x bosia@latest add block files/upload-area
```

Drop zone yang dapat dikomposisi. Klik atau seret file masuk, lihat preview, tekan Upload — block mengirim `multipart/form-data` ke `uploadUrl` Anda dan melaporkan progres lewat `XMLHttpRequest`. Tanpa asumsi tentang backend Anda; Anda menyediakan URL dan membaca respons JSON di `onUploaded`.

## Preview

## Install

```bash
bun x bosia@latest add block files/upload-area
```

Menarik `ui/button`, `ui/label`, `ui/progress`, `ui/sonner`, dan paket npm [`@lucide/svelte`](/components/ui/icon/).

## Usage

```svelte
<script lang="ts">
	import UploadArea from "$lib/blocks/files/upload-area/block.svelte";
</script>

<UploadArea uploadUrl="/api/upload" onUploaded={(res) => console.log(res.url)} />
```

Server diharapkan mengembalikan JSON berbentuk seperti `{ "url": "https://...", ... }`. Butuh backend siap pakai? Instal [fitur `file-upload`](/docs/guides/file-upload) — ia menyediakan `/api/files` dengan kompresi `Bun.Image` dan penyimpanan lokal/S3 serta cocok dengan bentuk respons ini.

## Props

| Prop            | Type                                                            | Default     | Description                                                   |
| --------------- | --------------------------------------------------------------- | ----------- | ------------------------------------------------------------- |
| `uploadUrl`     | `string`                                                        | —           | Endpoint yang menerima `multipart/form-data`.                 |
| `accept`        | `string`                                                        | `"image/*"` | Nilai `<input accept>`.                                       |
| `maxSizeMB`     | `number`                                                        | `10`        | File lebih besar dari ini ditolak dengan toast.               |
| `fieldName`     | `string`                                                        | `"file"`    | Nama field FormData untuk file.                               |
| `extraFields`   | `Record<string, string>`                                        | `{}`        | Field FormData tambahan yang dilampirkan ke permintaan.       |
| `headers`       | `Record<string, string>`                                        | `{}`        | Header permintaan tambahan.                                   |
| `enableCrop`    | `boolean`                                                       | `false`     | Menampilkan tombol crop pada thumbnail preview.               |
| `onCropRequest` | `(file: File, done: (cropped: File) => void) => void`           | —           | Dipanggil saat pengguna mengeklik crop. Panggil `done(file)`. |
| `onUploaded`    | `(response: { url: string } & Record<string, unknown>) => void` | —           | Respons server setelah 2xx.                                   |
| `onError`       | `(err: Error) => void`                                          | —           | Galat jaringan / parse / non-2xx.                             |
| `children`      | `Snippet`                                                       | —           | Teks CTA kustom di dalam area drop kosong.                    |

## Komposabilitas

`upload-area` dan `crop-image` adalah block independen. Untuk menambahkan langkah pemotongan, instal keduanya dan rangkai lewat `onCropRequest`. Lihat [Crop Image](/docs/blocks/files/crop-image/) untuk sisi penerima.

## Source

`src/lib/blocks/files/upload-area/block.svelte`
