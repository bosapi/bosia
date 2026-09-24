<script lang="ts">
	import type { PageProps } from "./$types";
	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Nested Loading Test | Bosia Demo</title>
</svelte:head>

<div class="space-y-6 max-w-2xl">
	<h1 class="text-3xl font-bold">Inherited loading skeleton</h1>
	<p class="text-muted-foreground">
		This folder has no <code>+loading.svelte</code> of its own. Navigating here still shows the one
		in the parent <code>loading-test/</code> folder, because a loading skeleton cascades to child routes
		the way layouts do — nearest ancestor wins.
	</p>
	<p>
		Navigate here from <a href="/loading-test" class="underline">the parent</a> to watch it.
	</p>
	<p class="font-mono text-xs opacity-40">loaded at {data.loadedAt}</p>
</div>
