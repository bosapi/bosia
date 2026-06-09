---
name: bosia-image-dialog
description: Multi-image picker dialog — Upload tab, External URL tab, and existing-images gallery. Returns string[] of URLs.
triggers:
    - image gallery
    - multi image picker
    - image dialog
    - replace image
    - gallery picker
    - select images
od:
    mode: scaffold
    category: framework
bosia:
    requires:
        blocks: [files/image-dialog, files/upload-area]
        feats: [file-upload]
    stack: [svelte-runes]
---

# bosia-image-dialog

## What it covers

- A modal dialog that bundles three input paths for picking images: upload, external URL, and re-pick from the user's library or already-attached entries.
- Returns the full intended `string[]` of URLs on Confirm so the caller can atomically replace the parent field.
- Reuses the existing `files/upload-area` block and the `file-upload` feature — no new server routes.

## When to use

- A parent entity stores **multiple** image URLs (gallery, listing photos, product media).
- A "replace image" UX where the user should see the current image alongside upload/URL options.
- An AI-generated page seeded with `https://images.unsplash.com/photo-…` placeholders the end-user should be able to swap out without losing the placeholder until they choose to.

## When NOT to use

- Single-image flows (avatar, profile picture, single cover) — drop `UploadArea` directly. The dialog overhead is wasted.
- Non-image attachments (PDFs, zips). The block assumes image MIME and renders thumbnails.
- Server-side ingest of remote URLs (fetch + re-upload). Out of scope; the External URL tab is a literal pass-through.

## Rules

### R1 — Requires `bosia-file-upload`

This block reuses `POST /api/files` (Upload tab) and `GET /api/files` (library). Install [[bosia-file-upload]] first and confirm auth is wired — both routes require `locals.user`.

### R2 — External URL is pass-through, not stored

The External URL tab pushes the literal string into the selection. There is no backend ingest, no copy-to-storage step. If a remote host rotates or removes the image, the parent entity will reference a dead URL. If durability matters, the caller (or a future feat) must fetch + re-upload manually. Surface this in any user-facing copy near the input.

### R3 — Mixed URL / id storage needs a resolver

The default `resolveUrl` returns entries starting with `http://`, `https://`, or `/` as-is and **throws** on anything else. If the parent entity stores `file.id` (bare uuid) rather than `file.url`, pass an explicit resolver:

```svelte
<ImageDialog
	existingImages={post.gallery}
	resolveUrl={(id) => `/uploads/${idToKey(id)}`}
	onConfirm={(urls) => save(urls)}
	bind:open
/>
```

The block returns URLs, never ids. If the persistence layer wants ids, the caller maps URL → id on save.

### R4 — Confirm returns the full set

`onConfirm(urls)` fires with the complete intended array. The caller replaces the field atomically — do not merge `urls` with stale parent state. The dialog does not auto-close on Confirm; the caller closes it (`open = false`) only after persistence succeeds, so a failed save can keep the selection visible.

### R5 — Single-image flows use `UploadArea` directly

For avatars and other one-image fields, mount `UploadArea` from [[bosia-file-upload]] R5 without the dialog. Forcing users through a tabbed modal for a single image is friction with no payoff.

### R6 — Selection is local until Confirm

Toggling thumbnails mutates internal state only. Cancel discards everything (including freshly uploaded files — the upload itself stays on disk per `file-upload` semantics, but the parent entity is unchanged). There are no partial commits, no on-the-fly persistence.

## Workflow

1. Install `bosia-file-upload` (auth + feat + UploadArea + crop-image).
2. `bosia_add_block files/image-dialog` (depends on `files/upload-area`, which is already installed by step 1).
3. Import + mount:

    ```svelte
    <script lang="ts">
    	import ImageDialog from "$lib/blocks/files/image-dialog/block.svelte";

    	let open = $state(false);
    	let gallery = $state<string[]>(post.images);

    	async function save(urls: string[]) {
    		await fetch(`/api/posts/${post.id}`, {
    			method: "PATCH",
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

4. The Upload tab posts to `/api/files` and pushes `record.url` into the selection on success.
5. The External URL tab validates `http(s)://` client-side, then pushes the URL into the selection.
6. The "Current" row renders `existingImages` via `resolveUrl()`. The "Your library" row fetches `GET /api/files` once on mount.

## Anti-patterns

- Using `image-dialog` for a single-image avatar (use `UploadArea`).
- Persisting `record.id` on the parent entity — the block returns URLs, store URLs.
- Adding a "save copy" backend ingest path inside this block — out of scope; open a follow-up feat.
- Merging `onConfirm(urls)` with the parent's current list (e.g. `[...parent.images, ...urls]`). The dialog already shows the existing images for re-selection — merging double-counts them.
- Forgetting `bind:open` on the dialog (one-way `open={open}` will leave the dialog stuck open after backdrop click).

## Checklist gate

P0:

- [ ] [[bosia-file-upload]] installed first; `locals.user` resolves on `/api/files`.
- [ ] `bosia_add_block files/image-dialog` ran clean.
- [ ] Caller mounts with `bind:open`.
- [ ] `onConfirm` replaces the parent field atomically (no merge with stale state).
- [ ] If `existingImages` carries bare ids, an explicit `resolveUrl` is passed.

P1:

- [ ] `max` set to a real bound when the entity has a server-side cap.
- [ ] External URL copy explains the dead-link risk (or the tab is hidden via a follow-up prop if the team forbids it).
- [ ] Parent entity column is `text[]` (or json array) — nullable per-element is unnecessary; an empty array represents "no images."

## Cross-references

- [[bosia-file-upload]] — prerequisite feat + UploadArea reused inside the dialog.
- [[bosia-block-compose]] — embedding the dialog inside a larger form.
- [[bosia-bun-runtime]] — `Bun.Image` pipeline behind `/api/files` (relevant when debugging Upload-tab 400s).
