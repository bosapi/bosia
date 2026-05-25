<script lang="ts">
	import type { Snippet } from "svelte";
	import { Button } from "$lib/components/ui/button";
	import { Progress } from "$lib/components/ui/progress";
	import { Icon } from "$lib/components/ui/icon";
	import { toast } from "$lib/components/ui/sonner";

	type UploadResponse = { url: string } & Record<string, unknown>;

	let {
		uploadUrl,
		accept = "image/*",
		maxSizeMB = 10,
		fieldName = "file",
		extraFields = {},
		headers = {},
		enableCrop = false,
		onCropRequest,
		onUploaded,
		onError,
		children,
	}: {
		uploadUrl: string;
		accept?: string;
		maxSizeMB?: number;
		fieldName?: string;
		extraFields?: Record<string, string>;
		headers?: Record<string, string>;
		enableCrop?: boolean;
		onCropRequest?: (file: File, done: (cropped: File) => void) => void;
		onUploaded: (response: UploadResponse) => void;
		onError?: (err: Error) => void;
		children?: Snippet;
	} = $props();

	let file = $state<File | null>(null);
	let preview = $state<string | null>(null);
	let progress = $state<number | null>(null);
	let isUploading = $state(false);
	let dragActive = $state(false);
	let inputEl = $state<HTMLInputElement | null>(null);

	const maxBytes = $derived(maxSizeMB * 1024 * 1024);

	function setFile(next: File | null) {
		if (preview) URL.revokeObjectURL(preview);
		file = next;
		preview = next ? URL.createObjectURL(next) : null;
	}

	function validate(candidate: File): boolean {
		if (candidate.size > maxBytes) {
			toast.error(`File is too large. Max ${maxSizeMB} MB.`);
			return false;
		}
		return true;
	}

	function handleFiles(files: FileList | null) {
		if (!files || !files[0]) return;
		const picked = files[0];
		if (!validate(picked)) return;
		setFile(picked);
	}

	function onSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		handleFiles(input.files);
		input.value = "";
	}

	function onDrop(event: DragEvent) {
		event.preventDefault();
		dragActive = false;
		handleFiles(event.dataTransfer?.files ?? null);
	}

	function onDragOver(event: DragEvent) {
		event.preventDefault();
		dragActive = true;
	}

	function onDragLeave() {
		dragActive = false;
	}

	function clearFile() {
		setFile(null);
		progress = null;
	}

	function requestCrop() {
		if (!file || !onCropRequest) return;
		onCropRequest(file, (cropped) => setFile(cropped));
	}

	function upload() {
		if (!file) return;
		isUploading = true;
		progress = 0;

		const formData = new FormData();
		formData.append(fieldName, file);
		for (const [key, value] of Object.entries(extraFields)) {
			formData.append(key, value);
		}

		const xhr = new XMLHttpRequest();

		xhr.upload.addEventListener("progress", (e) => {
			if (e.lengthComputable) {
				progress = Math.round((e.loaded / e.total) * 100);
			}
		});

		xhr.addEventListener("load", () => {
			isUploading = false;
			if (xhr.status >= 200 && xhr.status < 300) {
				try {
					const response = JSON.parse(xhr.responseText) as UploadResponse;
					onUploaded(response);
					clearFile();
				} catch (err) {
					const error = err instanceof Error ? err : new Error("Invalid upload response");
					toast.error(error.message);
					onError?.(error);
					progress = null;
				}
			} else {
				const error = new Error(`Upload failed (${xhr.status})`);
				toast.error(error.message);
				onError?.(error);
				progress = null;
			}
		});

		xhr.addEventListener("error", () => {
			isUploading = false;
			progress = null;
			const error = new Error("Network error during upload");
			toast.error(error.message);
			onError?.(error);
		});

		xhr.open("POST", uploadUrl);
		xhr.setRequestHeader("Accept", "application/json");
		for (const [key, value] of Object.entries(headers)) {
			xhr.setRequestHeader(key, value);
		}
		xhr.send(formData);
	}
</script>

<div class="flex flex-col gap-4">
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="rounded-lg border-2 border-dashed p-8 text-center transition-colors {dragActive
			? 'border-primary bg-muted/50'
			: 'hover:bg-muted/50'}"
		ondragover={onDragOver}
		ondragleave={onDragLeave}
		ondrop={onDrop}
	>
		<input bind:this={inputEl} type="file" class="hidden" {accept} onchange={onSelect} />

		{#if preview}
			<div class="group relative mx-auto mb-4 w-full max-w-xs">
				<img
					src={preview}
					alt="Preview"
					class="mx-auto max-h-[200px] rounded-lg shadow-sm"
					loading="lazy"
				/>
				<div class="absolute -right-2 -top-2 flex gap-1">
					{#if enableCrop && onCropRequest}
						<button
							type="button"
							class="rounded-full bg-secondary p-1 text-secondary-foreground shadow-sm hover:bg-secondary/80"
							onclick={requestCrop}
							title="Crop"
						>
							<Icon name="crop" size={16} />
						</button>
					{/if}
					<button
						type="button"
						class="rounded-full bg-destructive p-1 text-destructive-foreground shadow-sm hover:bg-destructive/90"
						onclick={clearFile}
						title="Remove"
					>
						<Icon name="x" size={16} />
					</button>
				</div>
			</div>
		{:else}
			<button
				type="button"
				class="flex w-full cursor-pointer flex-col items-center gap-2"
				onclick={() => inputEl?.click()}
			>
				<div class="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
					<Icon name="upload" size={24} class="text-muted-foreground" />
				</div>
				{#if children}
					{@render children()}
				{:else}
					<span class="text-sm font-medium">Click to upload or drag and drop</span>
					<span class="text-xs text-muted-foreground">Max {maxSizeMB} MB</span>
				{/if}
			</button>
		{/if}
	</div>

	{#if file}
		<div class="flex justify-end">
			<Button disabled={!file || isUploading} onclick={upload}>
				{#if isUploading}
					<Icon name="loader" size={16} class="mr-2 animate-spin" />
					Uploading...
				{:else}
					Upload
				{/if}
			</Button>
		</div>
	{/if}

	{#if progress !== null && progress > 0}
		<div class="rounded-lg bg-muted p-4">
			<div class="mb-2 flex items-center justify-between">
				<span class="text-sm font-medium">Uploading...</span>
				<span class="text-sm text-muted-foreground">{progress}%</span>
			</div>
			<Progress value={progress} />
		</div>
	{/if}
</div>
