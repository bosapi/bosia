<script lang="ts">
	import EasyCropper from "svelte-easy-crop";
	import { Button } from "$lib/components/ui/button";
	import { Label } from "$lib/components/ui/label";
	import { Slider } from "$lib/components/ui/slider";
	import { Icon } from "$lib/components/ui/icon";
	import { toast } from "$lib/components/ui/sonner";

	type Shape = "rect" | "round";
	type OutputFormat = "auto" | "image/jpeg" | "image/png" | "image/webp";
	type AspectPreset = { label: string; ratio: number; shape: Shape };
	type PixelCrop = { x: number; y: number; width: number; height: number };

	const Cropper =
		(EasyCropper as unknown as { default?: typeof EasyCropper }).default ?? EasyCropper;

	const DEFAULT_PRESETS: AspectPreset[] = [
		{ label: "Circle", ratio: 1, shape: "round" },
		{ label: "Square", ratio: 1, shape: "rect" },
		{ label: "16:9", ratio: 16 / 9, shape: "rect" },
		{ label: "4:3", ratio: 4 / 3, shape: "rect" },
	];

	let {
		imageSrc,
		originalType = "image/jpeg",
		aspectPresets = DEFAULT_PRESETS,
		defaultAspect = 1,
		defaultShape = "rect" as Shape,
		maxWidth = 1920,
		maxHeight = 1080,
		quality = 0.85,
		format = "auto" as OutputFormat,
		crossOrigin = undefined as "" | "anonymous" | "use-credentials" | undefined,
		onCropComplete,
		onCancel,
	}: {
		imageSrc: string;
		originalType?: string;
		aspectPresets?: AspectPreset[];
		defaultAspect?: number;
		defaultShape?: Shape;
		/** Max output width in px; cropped image scales down to fit. Set to 0 to disable. */
		maxWidth?: number;
		/** Max output height in px; cropped image scales down to fit. Set to 0 to disable. */
		maxHeight?: number;
		/** Encoder quality 0–1 (applies to jpeg/webp; ignored for png). */
		quality?: number;
		/** Output format. "auto" picks webp for round/png sources, jpeg otherwise. */
		format?: OutputFormat;
		/** Set to "anonymous" when cropping a cross-origin URL (source must return CORS headers). Leave undefined for object URLs / same-origin. */
		crossOrigin?: "" | "anonymous" | "use-credentials";
		onCropComplete: (blob: Blob) => void;
		onCancel: () => void;
	} = $props();

	let crop = $state({ x: 0, y: 0 });
	let zoom = $state(1);
	let aspect = $state(defaultAspect);
	let cropShape = $state<Shape>(defaultShape);
	let pixelCrop = $state<PixelCrop | null>(null);
	let isProcessing = $state(false);

	function handleCropComplete(e: { pixels?: PixelCrop; detail?: { pixels?: PixelCrop } }) {
		const pixels = e.pixels ?? e.detail?.pixels;
		if (
			pixels &&
			(!pixelCrop ||
				pixels.x !== pixelCrop.x ||
				pixels.y !== pixelCrop.y ||
				pixels.width !== pixelCrop.width ||
				pixels.height !== pixelCrop.height)
		) {
			pixelCrop = pixels;
		}
	}

	function setPreset(preset: AspectPreset) {
		aspect = preset.ratio;
		cropShape = preset.shape;
	}

	function isActive(preset: AspectPreset): boolean {
		return preset.ratio === aspect && preset.shape === cropShape;
	}

	async function handleSave() {
		if (!pixelCrop || !imageSrc) {
			toast.error("Please crop the image first or wait for it to load.");
			return;
		}
		isProcessing = true;
		try {
			const blob = await getCroppedImg(imageSrc, pixelCrop, cropShape);
			if (blob) {
				onCropComplete(blob);
			} else {
				toast.error("Failed to create cropped image.");
			}
		} catch (err) {
			console.error(err);
			toast.error("An error occurred while cropping.");
		} finally {
			isProcessing = false;
		}
	}

	function createImage(url: string): Promise<HTMLImageElement> {
		return new Promise((resolve, reject) => {
			const image = new Image();
			image.addEventListener("load", () => resolve(image));
			image.addEventListener("error", (e) => reject(e));
			if (crossOrigin !== undefined) image.crossOrigin = crossOrigin;
			image.src = url;
		});
	}

	function fitInside(w: number, h: number, maxW: number, maxH: number) {
		const lockW = maxW > 0 ? maxW : Infinity;
		const lockH = maxH > 0 ? maxH : Infinity;
		const scale = Math.min(1, lockW / w, lockH / h);
		return { w: Math.round(w * scale), h: Math.round(h * scale) };
	}

	function canEncode(mime: string): boolean {
		const c = document.createElement("canvas");
		c.width = c.height = 1;
		return c.toDataURL(mime).startsWith(`data:${mime}`);
	}

	function pickFormat(shape: Shape): "image/jpeg" | "image/png" | "image/webp" {
		if (format !== "auto") return format;
		if (shape === "round") return canEncode("image/webp") ? "image/webp" : "image/png";
		if (originalType.startsWith("image/png")) {
			return canEncode("image/webp") ? "image/webp" : "image/png";
		}
		return "image/jpeg";
	}

	async function getCroppedImg(
		src: string,
		pixels: PixelCrop,
		shape: Shape,
	): Promise<Blob | null> {
		const image = await createImage(src);

		// Step 1 — extract the crop into an off-screen canvas at native pixels.
		const cropCanvas = document.createElement("canvas");
		const cropCtx = cropCanvas.getContext("2d");
		if (!cropCtx) return null;
		cropCanvas.width = pixels.width;
		cropCanvas.height = pixels.height;
		cropCtx.drawImage(
			image,
			pixels.x,
			pixels.y,
			pixels.width,
			pixels.height,
			0,
			0,
			pixels.width,
			pixels.height,
		);

		if (shape === "round") {
			cropCtx.globalCompositeOperation = "destination-in";
			cropCtx.beginPath();
			cropCtx.arc(
				pixels.width / 2,
				pixels.height / 2,
				Math.min(pixels.width, pixels.height) / 2,
				0,
				2 * Math.PI,
			);
			cropCtx.fill();
		}

		// Step 2 — scale down to fit within maxWidth / maxHeight (no upscale).
		const target = fitInside(pixels.width, pixels.height, maxWidth, maxHeight);
		const outCanvas = document.createElement("canvas");
		outCanvas.width = target.w;
		outCanvas.height = target.h;
		const outCtx = outCanvas.getContext("2d");
		if (!outCtx) return null;
		outCtx.imageSmoothingEnabled = true;
		outCtx.imageSmoothingQuality = "high";
		outCtx.drawImage(cropCanvas, 0, 0, target.w, target.h);

		// Step 3 — encode. PNG ignores quality; jpeg/webp respect it.
		const outFormat = pickFormat(shape);
		return new Promise((resolve) => {
			outCanvas.toBlob(
				(blob) => resolve(blob),
				outFormat,
				outFormat === "image/png" ? undefined : quality,
			);
		});
	}
</script>

<div class="flex w-full flex-col gap-4">
	<div
		class="relative w-full overflow-hidden rounded-lg border bg-black/5"
		style="height: 400px;"
	>
		<Cropper
			image={imageSrc}
			bind:crop
			bind:zoom
			{aspect}
			{cropShape}
			showGrid
			{crossOrigin}
			oncropcomplete={handleCropComplete}
		/>
	</div>

	<div class="space-y-4">
		<div class="flex flex-wrap justify-center gap-2">
			{#each aspectPresets as preset (preset.label)}
				<Button
					variant={isActive(preset) ? "default" : "outline"}
					size="sm"
					onclick={() => setPreset(preset)}
				>
					{preset.label}
				</Button>
			{/each}
		</div>

		<div class="flex justify-center">
			<div class="w-full max-w-[240px] space-y-2">
				<div class="flex items-center gap-2">
					<Icon name="zoom-in" size={16} />
					<Label for="crop-zoom">Zoom</Label>
				</div>
				<Slider id="crop-zoom" bind:value={zoom} min={1} max={3} step={0.1} />
			</div>
		</div>

		<div class="mt-2 flex justify-end gap-2 border-t pt-2">
			<Button variant="outline" onclick={onCancel}>Cancel</Button>
			<Button onclick={handleSave} disabled={isProcessing}>
				{#if isProcessing}
					<Icon name="loader" size={16} class="mr-2 animate-spin" />
					Processing...
				{:else}
					Crop
				{/if}
			</Button>
		</div>
	</div>
</div>
