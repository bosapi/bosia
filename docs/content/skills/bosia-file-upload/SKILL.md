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
        routes: [api/files, api/files/[id]]
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

Run `file_upload_install` once. It is idempotent with `force: true`. Don't `bosia_add_block files/upload-area` separately — the install tool covers it and also pulls the feature it depends on.

### R2 — Image-only by default

FileService accepts only `image/jpeg | png | webp | heic | avif`. Files are decoded with `Bun.Image`, resized to fit 1920×1080, and re-encoded to WebP at 0.85 quality. Don't try to upload PDFs/zips — they will 400.

### R3 — Storage adapter via env

- `STORAGE_DRIVER=local` (default) → writes to `./uploads/`, served by `uploads-static-server.ts`.
- `STORAGE_DRIVER=s3` → set `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_ENDPOINT`.

Add chosen keys to `.env.example` (see [[bosia-env]] R5).

### R4 — DB table is auto-included

`feat file-upload` ships `file.{pg|mysql|sqlite}.table.ts` and picks one at install via `-d sqlite|postgres|mysql` (defaults to sqlite under `-y`). The repository assumes the matching driver from your existing Drizzle setup (see [[bosia-drizzle-feature]]). No manual migration write — run your normal migrate command after install.

### R5 — Frontend wiring

`<UploadArea uploadUrl="/api/files" onUploaded={(rec) => ...} />`. The response shape is the full FileRecord: `{ id, url, key, mime, size, width, height }`. Persist `record.url` (not `record.id`) when you want a public-facing src.

## Workflow

1. Run `file_upload_install` (set `include_crop: true` if the user wants client-side crop).
2. Add storage env keys to `.env.example` + `.env.local` per R3.
3. Import `UploadArea` into the target page/form.
4. On `onUploaded`, store `record.url` on the parent entity (user.avatarUrl, post.coverUrl, etc.).
5. Run migration so the `files` table exists.
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

- [ ] `include_crop: true` only when end-user actually needs crop.
- [ ] S3 chosen for production; local OK for dev.
- [ ] Parent entity has a nullable URL column (uploads may fail).

## Cross-references

- [[bosia-env]] — env conventions for `STORAGE_DRIVER` and S3 keys.
- [[bosia-drizzle-feature]] — the files table follows the standard Drizzle feature shape.
- [[bosia-elysia-routes]] — POST /api/files is a standard route handler.
- [[bosia-block-compose]] — composing UploadArea inside larger forms.
