<script lang="ts">
	import type { PageProps } from "./$types";
	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Loading Test | Bosia Demo</title>
</svelte:head>

<div class="space-y-6 max-w-2xl">
	<h1 class="text-3xl font-bold">Loading skeleton demo</h1>
	<p class="text-muted-foreground">
		This page's <code>+page.server.ts</code> sleeps 1.5s on purpose. While it loads, Bosia renders
		the sibling <code>+loading.svelte</code> skeleton inside the shared <code>(public)</code> layout —
		so the header and footer stay mounted and only this content area shows the skeleton.
	</p>
	<p>Navigate here from <a href="/" class="underline">Home</a> or the nav bar to see it.</p>
	<p class="font-mono text-xs opacity-40">loaded at {data.loadedAt}</p>
</div>
