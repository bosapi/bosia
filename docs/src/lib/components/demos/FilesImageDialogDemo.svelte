<script lang="ts">
	import { onMount } from "svelte";
	import { Button } from "$lib/components/ui/button";
	import ImageDialog from "$blocks/files/image-dialog/block.svelte";

	let mounted = $state(false);
	let open = $state(false);
	let gallery = $state<string[]>([
		"https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=80",
		"https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&q=80",
	]);
	let lastConfirm = $state<string[] | null>(null);

	onMount(() => {
		mounted = true;
	});

	function handleConfirm(urls: string[]) {
		gallery = urls;
		lastConfirm = urls;
		open = false;
	}
</script>

<div class="flex w-full flex-col items-center gap-4 p-4 justify-center">
	{#if !mounted}
		<div class="rounded-lg border bg-muted p-8 text-center text-sm text-muted-foreground">
			Loading…
		</div>
	{:else}
		<div class="flex flex-wrap gap-2">
			{#each gallery as url (url)}
				<img
					src={url}
					alt=""
					class="h-20 w-20 rounded-md border object-cover"
					crossorigin="anonymous"
					loading="lazy"
				/>
			{/each}
			{#if gallery.length === 0}
				<span class="text-sm text-muted-foreground">No images.</span>
			{/if}
		</div>

		<Button onclick={() => (open = true)}>Edit images</Button>

		{#if lastConfirm}
			<p class="text-xs text-muted-foreground">
				Last confirm: <code>{JSON.stringify(lastConfirm)}</code>
			</p>
		{/if}

		<ImageDialog
			bind:open
			existingImages={gallery}
			max={6}
			onConfirm={handleConfirm}
			onCancel={() => (open = false)}
		/>
	{/if}
</div>
