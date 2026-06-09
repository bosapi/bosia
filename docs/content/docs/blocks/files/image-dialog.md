---
title: Files — Image Dialog
description: Multi-image picker dialog — Upload tab, External URL tab, and existing-images gallery. Returns string[] of URLs on confirm.
demo: FilesImageDialogDemo
---

```bash
bun x bosia@latest add block files/image-dialog
```

A modal dialog that bundles the three input paths users actually reach for when picking images: drag-and-drop **upload**, paste an **external URL**, and re-pick from the **existing gallery** (current entity + the signed-in user's full library). Returns the full intended array of URLs on Confirm so the caller can atomically replace the parent field.

## Preview

## Install

```bash
bun x bosia@latest add block files/image-dialog
```

Pulls `ui/button`, `ui/dialog`, `ui/input`, `ui/label`, `ui/sonner`, `ui/tabs`, the [`files/upload-area`](/docs/blocks/files/upload-area/) block, and the [`@lucide/svelte`](/components/ui/icon/) npm package. The block reuses the [`file-upload` feature](/docs/guides/file-upload) routes (`POST /api/files`, `GET /api/files`) — install that first.

## Usage

```svelte
<script lang="ts">
	import ImageDialog from "$lib/blocks/files/image-dialog/block.svelte";

	let open = $state(false);
	let gallery = $state<string[]>([
		"https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
	]);

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

The dialog does **not** auto-close on Confirm — keep the selection visible while you persist, then flip `open = false` after the save resolves so failures can keep the picker mounted.

When the dialog opens, `existingImages` are **pre-selected** so Confirm without further interaction is a no-op. Uploading or adding a URL **appends** to the selection; clicking an existing thumbnail toggles it off (removal). `onConfirm` always fires with the full intended set — caller does an atomic replace.

## Props

| Prop             | Type                        | Default                                             | Description                                                                                                  |
| ---------------- | --------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `open`           | `boolean`                   | `false`                                             | Bindable. Whether the dialog is shown.                                                                       |
| `existingImages` | `string[]`                  | `[]`                                                | Already-attached entries. May be `http(s)://`, `/uploads/...`, or bare ids (require a `resolveUrl`).         |
| `resolveUrl`     | `(entry: string) => string` | URL-shaped pass-through, throws on ids              | Convert an `existingImages` entry to a renderable URL. Default throws if the entry isn't already URL-shaped. |
| `max`            | `number`                    | `Infinity`                                          | Max selectable. Adding past the cap shows a toast.                                                           |
| `title`          | `string`                    | `"Select images"`                                   | Dialog title.                                                                                                |
| `description`    | `string`                    | `"Upload, paste a URL, or pick from your library."` | Dialog description under the title.                                                                          |
| `accept`         | `string`                    | `"image/*"`                                         | Forwarded to the inner `UploadArea`.                                                                         |
| `maxSizeMB`      | `number`                    | `10`                                                | Forwarded to the inner `UploadArea`.                                                                         |
| `enableCrop`     | `boolean`                   | `false`                                             | Forwarded to the inner `UploadArea`.                                                                         |
| `onConfirm`      | `(urls: string[]) => void`  | —                                                   | Fires on Confirm with the full intended set. **Does not** auto-close the dialog.                             |
| `onCancel`       | `() => void`                | —                                                   | Fires on Cancel; the dialog closes itself.                                                                   |

## Three input paths

- **Upload tab** — embeds [`UploadArea`](/docs/blocks/files/upload-area/) pointed at `/api/files`. On success, `record.url` is pushed into the selection.
- **External URL tab** — client-validated `http(s)://` only. Pass-through to the parent entity — there is no backend ingest. If the remote host rotates the image, the parent field references a dead URL.
- **Existing gallery** — top row shows `existingImages` via `resolveUrl()` (pre-selected on open; click to remove). Below, the signed-in user's full library is fetched once on mount from `GET /api/files`. Each thumbnail is a multi-select toggle.

## Storing URLs vs ids

The block returns URLs (`record.url`), never ids. If your persistence layer stores ids, map URL → id on save in the parent — keep the dialog's contract URL-only. If your existing column stores ids, supply an explicit resolver:

```svelte
<ImageDialog
	existingImages={post.gallery}
	resolveUrl={(id) => `/uploads/${idToKey(id)}`}
	onConfirm={save}
	bind:open
/>
```

The default resolver returns URL-shaped entries as-is and **throws** on bare ids — failing loudly beats silently rendering broken thumbnails.

## Composability

`image-dialog` reuses `upload-area`, but for single-image flows (avatars, single cover) you should mount `upload-area` directly — the tabbed modal is friction without payoff at that scale. See [Upload Area](/docs/blocks/files/upload-area/) for the leaner primitive.

## Source

`src/lib/blocks/files/image-dialog/block.svelte`
