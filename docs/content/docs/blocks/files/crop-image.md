---
title: Files — Crop Image
description: Interactive image cropper with aspect presets, zoom, and rect/round shapes. Returns a cropped Blob.
demo: FilesUploadCropDemo
---

```bash
bun x bosia@latest add block files/crop-image
```

A self-contained image cropper. Pass `imageSrc`, get a `Blob` back via `onCropComplete`. Aspect-ratio presets (Circle / Square / 16:9 / 4:3) ship as defaults; pass `aspectPresets` to override. Zoom via slider.

**Resize + compress built-in.** The cropped output is scaled down to fit within `maxWidth` × `maxHeight` (default 1920 × 1080, no upscale) and re-encoded at `quality` (default `0.85`). Round-shape output defaults to WebP for alpha support — much smaller than PNG. Override via `format`.

## Preview

## Install

```bash
bun x bosia@latest add block files/crop-image
```

Pulls `ui/button`, `ui/label`, `ui/slider`, `ui/sonner`, and the `svelte-easy-crop` and [`@lucide/svelte`](/components/ui/icon/) npm packages.

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

| Prop             | Type                                                    | Default                                     | Description                                                                 |
| ---------------- | ------------------------------------------------------- | ------------------------------------------- | --------------------------------------------------------------------------- |
| `imageSrc`       | `string`                                                | —                                           | Image URL or object URL to crop.                                            |
| `originalType`   | `string`                                                | `"image/jpeg"`                              | MIME type of source — informs `format: "auto"`.                             |
| `aspectPresets`  | `Array<{ label, ratio, shape }>`                        | Circle 1·round / Square 1·rect / 16:9 / 4:3 | Replace the preset row.                                                     |
| `defaultAspect`  | `number`                                                | `1`                                         | Initial aspect ratio.                                                       |
| `defaultShape`   | `"rect" \| "round"`                                     | `"rect"`                                    | Initial crop shape.                                                         |
| `maxWidth`       | `number`                                                | `1920`                                      | Resize the cropped output to fit this width. `0` disables. Never upscales.  |
| `maxHeight`      | `number`                                                | `1080`                                      | Resize the cropped output to fit this height. `0` disables. Never upscales. |
| `quality`        | `number` (0–1)                                          | `0.85`                                      | Encoder quality for jpeg/webp. Ignored for png.                             |
| `format`         | `"auto" \| "image/jpeg" \| "image/png" \| "image/webp"` | `"auto"`                                    | `"auto"` → webp for round / png-source (with png fallback), jpeg otherwise. |
| `onCropComplete` | `(blob: Blob) => void`                                  | —                                           | Fires when the user clicks **Crop**.                                        |
| `onCancel`       | `() => void`                                            | —                                           | Fires when the user clicks Cancel.                                          |

### Tuning size

The defaults (1920×1080 @ 0.85, WebP for round) keep avatar-style crops under ~50 KB and full-bleed crops well under 300 KB. For tighter targets:

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

## Pairs with `upload-area`

Wire it to `files/upload-area` via `onCropRequest`:

```svelte
<UploadArea
	uploadUrl="/api/upload"
	enableCrop
	onCropRequest={(file, done) => {
		// open this CropImage block, then call done(croppedFile)
	}}
	onUploaded={(res) => console.log(res.url)}
/>
```

## Source

`src/lib/blocks/files/crop-image/block.svelte`
