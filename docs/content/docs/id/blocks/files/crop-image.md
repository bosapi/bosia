---
title: Files — Crop Image
description: Pemotong gambar interaktif dengan preset aspek, zoom, dan bentuk persegi/bulat. Mengembalikan Blob hasil potongan.
demo: FilesUploadCropDemo
---

```bash
bun x bosia@latest add block files/crop-image
```

Pemotong gambar mandiri. Berikan `imageSrc`, dapatkan kembali `Blob` melalui `onCropComplete`. Preset rasio aspek (Circle / Square / 16:9 / 4:3) hadir sebagai default; berikan `aspectPresets` untuk menimpanya. Zoom lewat slider.

**Resize + kompresi bawaan.** Keluaran hasil potongan diperkecil agar muat dalam `maxWidth` × `maxHeight` (default 1920 × 1080, tanpa pembesaran) dan disandikan ulang pada `quality` (default `0.85`). Keluaran bentuk bulat default ke WebP untuk dukungan alpha — jauh lebih kecil daripada PNG. Timpa lewat `format`.

## Preview

## Install

```bash
bun x bosia@latest add block files/crop-image
```

Menarik `ui/button`, `ui/label`, `ui/slider`, `ui/sonner`, serta paket npm `svelte-easy-crop` dan [`@lucide/svelte`](/components/ui/icon/).

## Usage

```svelte
<script lang="ts">
	import CropImage from "$lib/blocks/files/crop-image/block.svelte";

	let src = $state<string | null>(null);
	let cropped = $state<Blob | null>(null);
</script>

{#if src}
	<CropImage
		imageSrc={src}
		onCropComplete={(blob) => {
			cropped = blob;
			src = null;
		}}
		onCancel={() => (src = null)}
	/>
{/if}
```

## Props

| Prop             | Type                                                    | Default                                     | Description                                                                   |
| ---------------- | ------------------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------- |
| `imageSrc`       | `string`                                                | —                                           | URL gambar atau object URL untuk dipotong.                                    |
| `originalType`   | `string`                                                | `"image/jpeg"`                              | Tipe MIME sumber — memberi tahu `format: "auto"`.                             |
| `aspectPresets`  | `Array<{ label, ratio, shape }>`                        | Circle 1·round / Square 1·rect / 16:9 / 4:3 | Mengganti baris preset.                                                       |
| `defaultAspect`  | `number`                                                | `1`                                         | Rasio aspek awal.                                                             |
| `defaultShape`   | `"rect" \| "round"`                                     | `"rect"`                                    | Bentuk potongan awal.                                                         |
| `maxWidth`       | `number`                                                | `1920`                                      | Resize keluaran agar muat dalam lebar ini. `0` menonaktifkan. Tak membesar.   |
| `maxHeight`      | `number`                                                | `1080`                                      | Resize keluaran agar muat dalam tinggi ini. `0` menonaktifkan. Tak membesar.  |
| `quality`        | `number` (0–1)                                          | `0.85`                                      | Kualitas encoder untuk jpeg/webp. Diabaikan untuk png.                        |
| `format`         | `"auto" \| "image/jpeg" \| "image/png" \| "image/webp"` | `"auto"`                                    | `"auto"` → webp untuk bulat / sumber-png (dengan fallback png), jpeg lainnya. |
| `onCropComplete` | `(blob: Blob) => void`                                  | —                                           | Terpicu saat pengguna mengeklik **Crop**.                                     |
| `onCancel`       | `() => void`                                            | —                                           | Terpicu saat pengguna mengeklik Cancel.                                       |

### Menyetel ukuran

Default-nya (1920×1080 @ 0.85, WebP untuk bulat) menjaga potongan gaya avatar di bawah ~50 KB dan potongan full-bleed jauh di bawah 300 KB. Untuk target lebih ketat:

```svelte
<CropImage
	imageSrc={src}
	maxWidth={1024}
	maxHeight={1024}
	quality={0.75}
	format="image/webp"
	onCropComplete={(blob) => console.log(blob.size, "bytes")}
	onCancel={() => {}}
/>
```

## Berpasangan dengan `upload-area`

Rangkai ke `files/upload-area` lewat `onCropRequest`:

```svelte
<UploadArea
	uploadUrl="/api/upload"
	enableCrop
	onCropRequest={(file, done) => {
		// buka block CropImage ini, lalu panggil done(croppedFile)
	}}
	onUploaded={(res) => console.log(res.url)}
/>
```

## Source

`src/lib/blocks/files/crop-image/block.svelte`
