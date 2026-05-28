---
name: bosia-file-upload
description: Image/file upload — install the file-upload feature + upload-area block, wire the UI, and persist to per-app storage (local or S3) with auto WebP resize.
triggers:
    - upload image
    - file upload
    - avatar
    - profile picture
    - media library
    - attachment
    - drag and drop upload
    - upload
    - delete file
    - unlink
    - S3
od:
    mode: scaffold
    category: framework
bosia:
    design: true
    requires:
        blocks: [files/upload-area]
        themes: []
        components: []
        feats: [file-upload]
    targets:
        routes: ["api/files", "api/files/[id]"]
    stack: [elysia-routes, svelte-runes]
---

# bosia-file-upload

## What it covers

- Installing the file-upload feature (FileService, storage adapter, DB table, POST/GET routes).
- Dropping the `files/upload-area` block into a page or form.
- Choosing local vs S3 storage via env.
- Reading uploaded records (id, url, mime, dimensions).

## When to use

- User asks for: image upload, avatar, profile picture, gallery, media library, attachment, file picker.
- An existing form needs an image field backed by a URL.

## When NOT to use

- Plain text file ingest with no UI (just use `fs_write`).
- Streaming uploads or chunked resumable uploads (out of scope; file-upload feature is single-shot multipart).

## Rules

### R1 — One scaffold call per app

Run `file_upload_install` once. It is idempotent — re-runs replace existing files. Don't `bosia_add_block files/upload-area` separately — the install tool covers it (via `meta.blocks` on the file-upload feature) and also installs `files/crop-image`.

### R2 — Image-only by default

FileService accepts only `image/jpeg | png | webp | heic | avif`. Files are decoded with `Bun.Image`, resized to fit 1920×1080, and re-encoded to WebP at quality 85. Don't try to upload PDFs/zips — they will 400. See [[bosia-bun-runtime]] § "Image processing — `Bun.Image`" for the exact API surface (constructor, `metadata()`, positional `resize`, per-format encoders).

### R3 — Storage adapter via env

- `STORAGE_DRIVER=local` (default) → writes to `./uploads/`, served by `uploads-static-server.ts`.
- `STORAGE_DRIVER=s3` → set `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_ENDPOINT`.

Add chosen keys to `.env.example` (see [[bosia-env]] R5).

### R4 — DB table is auto-included

`feat file-upload` ships `file.{pg|mysql|sqlite}.table.ts` and picks one at install via `-d sqlite|postgres|mysql` (defaults to sqlite under `-y`). The repository assumes the matching driver from your existing Drizzle setup (see [[bosia-drizzle-feature]]). No manual migration write — run your normal migrate command after install.

### R5 — Frontend wiring

The block ships only `block.svelte` (no `index.ts`) and lands at `src/lib/blocks/files/upload-area/block.svelte`. Import it explicitly:

```ts
import UploadArea from "$lib/blocks/files/upload-area/block.svelte";
```

Then use it:

```svelte
<UploadArea uploadUrl="/api/files" onUploaded={(rec) => ...} />
```

The response shape is the full FileRecord: `{ id, url, key, mime, size, width, height }`. Persist `record.url` (not `record.id`) when you want a public-facing src.

**Full prop surface** (see `registry/blocks/files/upload-area/block.svelte`):

- `uploadUrl: string` — POST endpoint (typically `/api/files`).
- `onUploaded: (record: FileRecord) => void` — success callback.
- `accept?: string` — MIME accept list (default `"image/*"`).
- `maxSizeMB?: number` — client-side size cap.
- `fieldName?: string` — multipart field name (default `"file"`).
- `extraFields?: Record<string, string>` — extra form fields appended to the POST.
- `headers?: Record<string, string>` — extra request headers.
- `enableCrop?: boolean` — enables the crop step (requires `files/crop-image`).
- `onCropRequest?: (file: File) => Promise<File>` — custom crop hook.
- `onError?: (err: Error) => void` — error callback.
- `children?: Snippet` — slot for custom drop-zone content.

### R5.5 — Delete cleans up storage

When a DB row that references an uploaded file is deleted, the handler **must** unlink the file from disk (or remove it from S3). Otherwise orphans pile up under `./uploads/` (local) or rack up cost (S3).

```ts
// inside the delete action / service
import { unlink } from "node:fs/promises";
import { existsSync } from "node:fs";
import { storage } from "$lib/storage";

const row = await db.select().from(files).where(eq(files.id, id)).limit(1);
if (!row[0]) return fail(404);

await db.delete(files).where(eq(files.id, id));

if (process.env.STORAGE_DRIVER === "s3") {
	await storage.deleteObject(row[0].key);
} else {
	const path = `./uploads/${row[0].key}`;
	if (existsSync(path)) await unlink(path);
}
```

Order matters: read the row first (to capture `key` / path), then delete the DB row, then unlink. If the unlink fails after the row is gone, log + continue — the row is the source of truth.

### R6 — Install-failure stop rule

If `file_upload_install` returns non-empty stderr OR a `404` anywhere in stdout/stderr, **STOP**. Report the error to the user verbatim. Do not fall back to a hand-rolled `<input type="file">` + `fetch("/api/files")` (the anti-pattern below). Quote the failed install output verbatim in the report so the framework bug can be diagnosed.

## Workflow

1. Run `file_upload_install` (installs the feature, the upload-area block, and the crop-image block in one shot).
2. Add storage env keys to `.env.example` + `.env.local` per R3.
3. Import `UploadArea` into the target page/form.
4. On `onUploaded`, store `record.url` on the parent entity (user.avatarUrl, post.coverUrl, etc.).
5. Run drizzle migration so the `files` table exists:
    ```
    bun run db:generate   # drizzle-kit generate
    bun run db:migrate    # apply
    ```
6. Verify in-browser: drag an image, see the toast, refresh and confirm the URL renders.

## Anti-patterns

- Calling `bosia_add_block files/upload-area` without the feature → 404 on POST /api/files.
- Storing the returned `id` on a parent entity as if it were the URL.
- Setting `accept="*"` on UploadArea — backend will reject non-image MIME and the UX confuses the user.
- Hand-rolling a `<form enctype="multipart">` instead of `UploadArea` — you lose progress + crop + size validation.

## Checklist gate

P0:

- [ ] `file_upload_install` ran successfully (feat + block installed).
- [ ] Storage env keys present in `.env.example`.
- [ ] Migration applied; `files` table exists.
- [ ] `UploadArea` receives `uploadUrl="/api/files"` and stores `record.url`.

P1:

- [ ] Use `enableCrop` prop on `<UploadArea>` only when end-user actually needs crop (the crop-image block is always installed by `file_upload_install`).
- [ ] S3 chosen for production; local OK for dev.
- [ ] Parent entity has a nullable URL column (uploads may fail).

## Cross-references

- [[bosia-env]] — env conventions for `STORAGE_DRIVER` and S3 keys.
- [[bosia-drizzle-feature]] — the files table follows the standard Drizzle feature shape.
- [[bosia-elysia-routes]] — POST /api/files is a standard route handler.
- [[bosia-block-compose]] — composing UploadArea inside larger forms.
- [[bosia-bun-runtime]] — `Bun.Image` API used by FileService.
