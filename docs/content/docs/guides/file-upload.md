---
title: File Upload
description: Server-side image uploads with Bun.Image compression and pluggable storage (local FS or S3).
---

The `file-upload` feature gives you a complete backend for the [`files/upload-area`](/docs/blocks/files/upload-area) block: a `POST /api/files` endpoint that accepts `multipart/form-data`, compresses images with `Bun.Image`, persists metadata via Drizzle, and stores the binary on local disk or S3.

## Install

```bash
bun x bosia@latest feat file-upload                  # prompts for DB dialect
bun x bosia@latest feat -y file-upload               # auto: sqlite default
bun x bosia@latest feat file-upload -d postgres      # explicit
bun x bosia@latest feat -y file-upload -d mysql      # auto + explicit dialect
```

`-y` / `--yes` is a `feat`-level flag (auto-confirms prompts, uses each feature's default option values). `-d` / `--dialect` belongs to the `file-upload` feature — declared in its `meta.json` `options`, parsed only when the feature is being installed. The CLI also installs the `drizzle` feature on first use and pulls the `files/upload-area` + `files/crop-image` blocks.

After install:

```bash
bun run db:generate
bun run db:migrate
```

## What you get

| Path                                              | Purpose                                |
| ------------------------------------------------- | -------------------------------------- |
| `src/features/file-upload/schemas/files.table.ts` | Drizzle table (matches your dialect)   |
| `src/features/file-upload/file.service.ts`        | Validation + compression orchestration |
| `src/features/file-upload/file.repository.ts`     | DB queries                             |
| `src/features/file-upload/storage/`               | `local` + `s3` adapters                |
| `src/routes/api/files/+server.ts`                 | `GET` list, `POST` upload              |
| `src/routes/api/files/[id]/+server.ts`            | `DELETE` (cascades to storage)         |
| `src/routes/uploads/[...path]/+server.ts`         | Streams files (local **and** S3)       |

## Env vars

Added to `.env` on install:

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

## Wire the block

```svelte
<script lang="ts">
	import UploadArea from "$lib/blocks/files/upload-area/block.svelte";
</script>

<UploadArea uploadUrl="/api/files" onUploaded={(res) => console.log(res.url)} />
```

The `POST /api/files` response shape matches what `upload-area` expects:

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

## Image processing

- Allowed MIME: `image/jpeg`, `image/png`, `image/webp`, `image/heic`, `image/avif`. Others are rejected with `400`.
- Decoded with `Bun.Image`, fit-inside resized to **1920×1080 max** (no upscale), re-encoded as **WebP @ q=0.85**.
- File extension always becomes `.webp` regardless of source format.

To change limits, edit the `MAX` constant in `file.service.ts`.

## Switching to S3

```env
STORAGE_DRIVER=s3
S3_BUCKET=my-bucket
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_ENDPOINT=https://nyc3.digitaloceanspaces.com   # optional, for non-AWS
```

Restart the server. Both drivers return app-relative `/uploads/<key>` URLs and serve through the `uploads/[...path]` route, so switching to S3 needs no client changes. Files stay private behind the same per-user ownership check — your bucket does **not** need to be public, and `S3_ENDPOINT` may be private/loopback-only (the server reaches it, the browser never does).

## Notes

- The `uploads/[...path]` route streams from the active driver (local FS or S3) behind an auth + ownership check, with a path-traversal guard. For high-traffic public assets you can instead front a public bucket with a CDN and have the S3 adapter return direct URLs — but the default keeps every object private.
- Cropping is client-side via the [`files/crop-image`](/docs/blocks/files/crop-image) block — wire it through `upload-area`'s `onCropRequest` prop.
