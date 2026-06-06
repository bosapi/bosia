---
title: Files — Upload Area
description: Drag-and-drop file upload area with preview, size validation, progress bar, and optional crop hook.
demo: FilesUploadCropDemo
---

```bash
bun x bosia@latest add block files/upload-area
```

A composable drop zone. Click or drag a file in, see a preview, hit Upload — the block POSTs `multipart/form-data` to your `uploadUrl` and reports progress via `XMLHttpRequest`. No assumptions about your backend; you supply the URL and read the JSON response in `onUploaded`.

## Preview

## Install

```bash
bun x bosia@latest add block files/upload-area
```

Pulls `ui/button`, `ui/label`, `ui/progress`, `ui/sonner`, and the [`@lucide/svelte`](/components/ui/icon/) npm package.

## Usage

```svelte
<script lang="ts">
	import UploadArea from "$lib/blocks/files/upload-area/block.svelte";
</script>

<UploadArea uploadUrl="/api/upload" onUploaded={(res) => console.log(res.url)} />
```

The server is expected to return JSON shaped like `{ "url": "https://...", ... }`. Need a ready-made backend? Install the [`file-upload` feature](/docs/guides/file-upload) — it ships `/api/files` with `Bun.Image` compression and local/S3 storage and matches this response shape.

## Props

| Prop            | Type                                                            | Default     | Description                                               |
| --------------- | --------------------------------------------------------------- | ----------- | --------------------------------------------------------- |
| `uploadUrl`     | `string`                                                        | —           | Endpoint that accepts `multipart/form-data`.              |
| `accept`        | `string`                                                        | `"image/*"` | `<input accept>` value.                                   |
| `maxSizeMB`     | `number`                                                        | `10`        | Files bigger than this are rejected with a toast.         |
| `fieldName`     | `string`                                                        | `"file"`    | FormData field name for the file.                         |
| `extraFields`   | `Record<string, string>`                                        | `{}`        | Extra FormData fields appended to the request.            |
| `headers`       | `Record<string, string>`                                        | `{}`        | Extra request headers.                                    |
| `enableCrop`    | `boolean`                                                       | `false`     | Show a crop button on the preview thumbnail.              |
| `onCropRequest` | `(file: File, done: (cropped: File) => void) => void`           | —           | Called when the user clicks crop. Call `done(file)` back. |
| `onUploaded`    | `(response: { url: string } & Record<string, unknown>) => void` | —           | Server response after a 2xx.                              |
| `onError`       | `(err: Error) => void`                                          | —           | Network / parse / non-2xx errors.                         |
| `children`      | `Snippet`                                                       | —           | Custom CTA text inside the empty drop area.               |

## Composability

`upload-area` and `crop-image` are independent blocks. To add a cropping step, install both and wire them via `onCropRequest`. See [Crop Image](/docs/blocks/files/crop-image/) for the receiving side.

## Source

`src/lib/blocks/files/upload-area/block.svelte`
