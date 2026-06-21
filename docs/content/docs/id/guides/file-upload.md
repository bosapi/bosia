---
title: File Upload
description: Upload gambar di sisi server dengan kompresi Bun.Image dan storage yang bisa dipasang (FS lokal atau S3).
---

Fitur `file-upload` memberi Anda backend lengkap untuk blok [`files/upload-area`](/docs/blocks/files/upload-area): sebuah endpoint `POST /api/files` yang menerima `multipart/form-data`, mengompresi gambar dengan `Bun.Image`, menyimpan metadata melalui Drizzle, dan menyimpan binary di disk lokal atau S3.

## Instalasi

```bash
bun x bosia@latest feat file-upload                  # prompts for DB dialect
bun x bosia@latest feat -y file-upload               # auto: sqlite default
bun x bosia@latest feat file-upload -d postgres      # explicit
bun x bosia@latest feat -y file-upload -d mysql      # auto + explicit dialect
```

`-y` / `--yes` adalah flag tingkat `feat` (mengonfirmasi prompt secara otomatis, memakai nilai opsi default tiap fitur). `-d` / `--dialect` milik fitur `file-upload` — dideklarasikan di `options` pada `meta.json`-nya, dan hanya di-parse saat fitur tersebut diinstal. CLI juga menginstal fitur `drizzle` pada penggunaan pertama dan menarik blok `files/upload-area` + `files/crop-image`.

Setelah instalasi:

```bash
bun run db:generate
bun run db:migrate
```

## Apa yang Anda dapat

| Path                                              | Tujuan                              |
| ------------------------------------------------- | ----------------------------------- |
| `src/features/file-upload/schemas/files.table.ts` | Tabel Drizzle (sesuai dialect Anda) |
| `src/features/file-upload/file.service.ts`        | Validasi + orkestrasi kompresi      |
| `src/features/file-upload/file.repository.ts`     | Query DB                            |
| `src/features/file-upload/storage/`               | Adapter `local` + `s3`              |
| `src/routes/api/files/+server.ts`                 | `GET` list, `POST` upload           |
| `src/routes/api/files/[id]/+server.ts`            | `DELETE` (mengalir ke storage)      |
| `src/routes/uploads/[...path]/+server.ts`         | Streaming file (lokal **dan** S3)   |

## Variabel env

Ditambahkan ke `.env` saat instalasi:

```env
STORAGE_DRIVER=local                  # or "s3"
UPLOAD_DIR=./uploads
PUBLIC_BASE_URL=http://localhost:3000
S3_BUCKET=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_ENDPOINT=                          # leave empty for AWS S3
S3_REGION=auto
```

## Menyambungkan blok

```svelte
<script lang="ts">
	import UploadArea from "$lib/blocks/files/upload-area/block.svelte";
</script>

<UploadArea uploadUrl="/api/files" onUploaded={(res) => console.log(res.url)} />
```

Bentuk respons `POST /api/files` cocok dengan apa yang diharapkan `upload-area`:

```json
{
	"id": "uuid",
	"key": "uuid.webp",
	"url": "http://localhost:3000/uploads/uuid.webp",
	"mime": "image/webp",
	"size": 123456,
	"width": 1440,
	"height": 1080,
	"createdAt": "..."
}
```

## Pemrosesan gambar

- MIME yang diizinkan: `image/jpeg`, `image/png`, `image/webp`, `image/heic`, `image/avif`. Lainnya ditolak dengan `400`.
- Didekode dengan `Bun.Image`, diubah ukuran fit-inside ke maksimum **1920×1080** (tanpa upscale), dikodekan ulang sebagai **WebP @ q=0.85**.
- Ekstensi file selalu menjadi `.webp` apa pun format sumbernya.

Untuk mengubah batas, edit konstanta `MAX` di `file.service.ts`.

## Beralih ke S3

```env
STORAGE_DRIVER=s3
S3_BUCKET=my-bucket
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_ENDPOINT=https://nyc3.digitaloceanspaces.com   # optional, for non-AWS
```

Restart server. Kedua driver mengembalikan URL relatif `/uploads/<key>` dan disajikan lewat route `uploads/[...path]`, jadi beralih ke S3 tak perlu ubah klien. File tetap privat di balik cek kepemilikan per-pengguna — bucket Anda **tidak** perlu publik, dan `S3_ENDPOINT` boleh privat/loopback saja (server menjangkaunya, browser tidak pernah).

## Catatan

- Route `uploads/[...path]` melakukan streaming dari driver aktif (FS lokal atau S3) di balik cek autentikasi + kepemilikan, dengan penjaga path-traversal. Untuk aset publik bertraffic tinggi, Anda bisa memajang bucket publik di belakang CDN dan membuat adapter S3 mengembalikan URL langsung — tapi default-nya menjaga tiap objek tetap privat.
- Cropping dilakukan di sisi klien melalui blok [`files/crop-image`](/docs/blocks/files/crop-image) — sambungkan melalui prop `onCropRequest` milik `upload-area`.
