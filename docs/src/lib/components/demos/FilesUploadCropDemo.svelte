<script lang="ts">
	import { onMount } from "svelte";
	import UploadArea from "$blocks/files/upload-area/block.svelte";
	import CropImage from "$blocks/files/crop-image/block.svelte";

	let mounted = $state(false);
	let cropSrc = $state<string | null>(null);
	let cropType = $state<string>("image/jpeg");
	let cropDone = $state<((cropped: File) => void) | null>(null);

	onMount(() => {
		mounted = true;
	});

	function handleCropRequest(file: File, done: (cropped: File) => void) {
		cropSrc = URL.createObjectURL(file);
		cropType = file.type || "image/jpeg";
		cropDone = done;
	}

	function finishCrop(blob: Blob) {
		if (!cropDone) return closeCrop();
		const ext = blob.type === "image/png" ? "png" : blob.type === "image/webp" ? "webp" : "jpg";
		const file = new File([blob], `cropped.${ext}`, { type: blob.type });
		cropDone(file);
		closeCrop();
	}

	function closeCrop() {
		if (cropSrc) URL.revokeObjectURL(cropSrc);
		cropSrc = null;
		cropDone = null;
	}
</script>

<div class="w-full p-4">
	{#if !mounted}
		<div class="rounded-lg border bg-muted p-8 text-center text-sm text-muted-foreground">
			Loading…
		</div>
	{:else if cropSrc}
		<CropImage
			imageSrc={cropSrc}
			originalType={cropType}
			onCropComplete={finishCrop}
			onCancel={closeCrop}
		/>
	{:else}
		<UploadArea
			uploadUrl="/api/demo-upload"
			enableCrop
			onCropRequest={handleCropRequest}
			onUploaded={(res) => console.log("uploaded", res)}
		/>
	{/if}
</div>
