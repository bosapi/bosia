<script lang="ts">
	import { onMount } from "svelte";
	import { Check, Link2, Loader, X } from "@lucide/svelte";
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle,
	} from "$lib/components/ui/dialog";
	import { Tabs, TabsContent, TabsList, TabsTrigger } from "$lib/components/ui/tabs";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import { toast } from "$lib/components/ui/sonner";
	import UploadArea from "../upload-area/block.svelte";

	type LibraryEntry = { id: string; url: string };

	const defaultResolver = (entry: string): string => {
		if (entry.startsWith("http://") || entry.startsWith("https://") || entry.startsWith("/")) {
			return entry;
		}
		throw new Error(
			`image-dialog: cannot resolve "${entry}" — pass a resolveUrl prop to convert ids to URLs.`,
		);
	};

	let {
		open = $bindable(false),
		existingImages = [],
		resolveUrl = defaultResolver,
		max = Number.POSITIVE_INFINITY,
		title = "Select images",
		description = "Upload, paste a URL, or pick from your library.",
		accept = "image/*",
		maxSizeMB = 10,
		enableCrop = false,
		onConfirm,
		onCancel,
	}: {
		open?: boolean;
		existingImages?: string[];
		resolveUrl?: (entry: string) => string;
		max?: number;
		title?: string;
		description?: string;
		accept?: string;
		maxSizeMB?: number;
		enableCrop?: boolean;
		onConfirm: (urls: string[]) => void;
		onCancel?: () => void;
	} = $props();

	const existingUrls = $derived.by(() => {
		try {
			return existingImages.map(resolveUrl);
		} catch (err) {
			const message = err instanceof Error ? err.message : "Failed to resolve existing image";
			toast.error(message);
			throw err;
		}
	});

	let selected = $state<string[]>([]);
	let library = $state<LibraryEntry[]>([]);
	let libraryLoading = $state(false);
	let libraryError = $state<string | null>(null);
	let urlInput = $state("");
	let activeTab = $state("upload");

	const atMax = $derived(selected.length >= max);

	onMount(async () => {
		libraryLoading = true;
		try {
			const res = await fetch("/api/files", { headers: { Accept: "application/json" } });
			if (!res.ok) throw new Error(`GET /api/files ${res.status}`);
			const rows = (await res.json()) as LibraryEntry[];
			library = rows;
		} catch (err) {
			libraryError = err instanceof Error ? err.message : "Failed to load library";
		} finally {
			libraryLoading = false;
		}
	});

	function toggle(url: string) {
		const i = selected.indexOf(url);
		if (i >= 0) {
			selected = selected.filter((_, idx) => idx !== i);
			return;
		}
		if (selected.length >= max) {
			toast.error(`Max ${max} image${max === 1 ? "" : "s"}.`);
			return;
		}
		selected = [...selected, url];
	}

	function addFromUpload(record: { url: string } & Record<string, unknown>) {
		if (!record?.url) return;
		if (selected.includes(record.url)) return;
		if (selected.length >= max) {
			toast.error(`Max ${max} image${max === 1 ? "" : "s"}.`);
			return;
		}
		selected = [...selected, record.url];
	}

	function addFromUrl() {
		const trimmed = urlInput.trim();
		if (!trimmed) return;
		if (!/^https?:\/\//i.test(trimmed)) {
			toast.error("URL must start with http:// or https://");
			return;
		}
		if (selected.includes(trimmed)) {
			toast.error("Already selected.");
			urlInput = "";
			return;
		}
		if (selected.length >= max) {
			toast.error(`Max ${max} image${max === 1 ? "" : "s"}.`);
			return;
		}
		selected = [...selected, trimmed];
		urlInput = "";
	}

	function handleConfirm() {
		onConfirm(selected);
	}

	function handleCancel() {
		onCancel?.();
		open = false;
	}

	function reset() {
		selected = [];
		urlInput = "";
		activeTab = "upload";
	}

	$effect(() => {
		if (!open) reset();
	});
</script>

<Dialog bind:open>
	<DialogContent class="max-w-3xl">
		<DialogHeader>
			<DialogTitle>{title}</DialogTitle>
			<DialogDescription>{description}</DialogDescription>
		</DialogHeader>

		<div class="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pt-5">
			<Tabs bind:value={activeTab}>
				<TabsList>
					<TabsTrigger value="upload">Upload</TabsTrigger>
					<TabsTrigger value="url">External URL</TabsTrigger>
				</TabsList>

				<TabsContent value="upload">
					<UploadArea
						uploadUrl="/api/files"
						{accept}
						{maxSizeMB}
						{enableCrop}
						onUploaded={addFromUpload}
					/>
				</TabsContent>

				<TabsContent value="url">
					<div class="flex flex-col gap-2">
						<Label for="image-dialog-url">Image URL</Label>
						<div class="flex gap-2">
							<Input
								id="image-dialog-url"
								type="url"
								placeholder="https://…"
								bind:value={urlInput}
								onkeydown={(e: KeyboardEvent) => {
									if (e.key === "Enter") {
										e.preventDefault();
										addFromUrl();
									}
								}}
							/>
							<Button
								type="button"
								onclick={addFromUrl}
								disabled={!urlInput.trim() || atMax}
							>
								<Link2 size={16} class="mr-2" />
								Add
							</Button>
						</div>
						<p class="text-xs text-muted-foreground">
							External URLs are stored as-is. Remote hosts may rotate or remove the
							image.
						</p>
					</div>
				</TabsContent>
			</Tabs>

			{#if existingUrls.length > 0}
				<section class="flex flex-col gap-2">
					<h3 class="text-sm font-medium">Current</h3>
					<div class="grid grid-cols-3 gap-2 sm:grid-cols-4">
						{#each existingUrls as url (url)}
							{@const isSelected = selected.includes(url)}
							<button
								type="button"
								class="group relative aspect-square overflow-hidden rounded-md border bg-muted transition-colors {isSelected
									? 'ring-2 ring-primary'
									: 'hover:border-primary/50'}"
								onclick={() => toggle(url)}
								aria-pressed={isSelected}
							>
								<img
									src={url}
									alt=""
									class="h-full w-full object-cover"
									loading="lazy"
									crossorigin="anonymous"
								/>
								{#if isSelected}
									<div
										class="absolute right-1 top-1 rounded-full bg-primary p-1 text-primary-foreground"
									>
										<Check size={12} />
									</div>
								{/if}
							</button>
						{/each}
					</div>
				</section>
			{/if}

			<section class="flex flex-col gap-2">
				<h3 class="text-sm font-medium">Your library</h3>
				{#if libraryLoading}
					<div class="flex items-center gap-2 text-sm text-muted-foreground">
						<Loader size={14} class="animate-spin" />
						Loading library…
					</div>
				{:else if libraryError}
					<p class="text-sm text-destructive">{libraryError}</p>
				{:else if library.length === 0}
					<p class="text-sm text-muted-foreground">No previous uploads yet.</p>
				{:else}
					<div class="grid grid-cols-3 gap-2 sm:grid-cols-4">
						{#each library as item (item.id)}
							{@const isSelected = selected.includes(item.url)}
							<button
								type="button"
								class="group relative aspect-square overflow-hidden rounded-md border bg-muted transition-colors {isSelected
									? 'ring-2 ring-primary'
									: 'hover:border-primary/50'}"
								onclick={() => toggle(item.url)}
								aria-pressed={isSelected}
							>
								<img
									src={item.url}
									alt=""
									class="h-full w-full object-cover"
									loading="lazy"
									crossorigin="anonymous"
								/>
								{#if isSelected}
									<div
										class="absolute right-1 top-1 rounded-full bg-primary p-1 text-primary-foreground"
									>
										<Check size={12} />
									</div>
								{/if}
							</button>
						{/each}
					</div>
				{/if}
			</section>

			{#if selected.length > 0}
				<section class="flex flex-col gap-2">
					<h3 class="text-sm font-medium">Selected ({selected.length})</h3>
					<div class="flex flex-wrap gap-2">
						{#each selected as url (url)}
							<div
								class="relative h-16 w-16 overflow-hidden rounded-md border bg-muted"
							>
								<img
									src={url}
									alt=""
									class="h-full w-full object-cover"
									loading="lazy"
									crossorigin="anonymous"
								/>
								<button
									type="button"
									class="absolute -right-1 -top-1 rounded-full bg-destructive p-0.5 text-destructive-foreground shadow-sm hover:bg-destructive/90"
									onclick={() => toggle(url)}
									title="Remove"
								>
									<X size={12} />
								</button>
							</div>
						{/each}
					</div>
				</section>
			{/if}
		</div>

		<DialogFooter>
			<div class="flex w-full items-center justify-between gap-2">
				<span class="text-sm text-muted-foreground">
					{selected.length} selected{Number.isFinite(max) ? ` / ${max}` : ""}
				</span>
				<div class="flex gap-2">
					<Button type="button" variant="outline" onclick={handleCancel}>Cancel</Button>
					<Button type="button" onclick={handleConfirm} disabled={selected.length === 0}>
						Confirm
					</Button>
				</div>
			</div>
		</DialogFooter>
	</DialogContent>
</Dialog>
