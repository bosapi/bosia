<script lang="ts">
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Platform bindings</title>
</svelte:head>

<div class="space-y-4">
	<h1 class="text-3xl font-bold tracking-tight">Platform bindings</h1>
	{#if data.onWorkers}
		<p>
			<code>platform.env.GREETING</code> from wrangler.jsonc:
			<strong id="greeting">{data.greeting ?? "(not set)"}</strong>
		</p>
	{:else}
		<p class="text-muted-foreground">Not running on Cloudflare Workers — no bindings here.</p>
	{/if}
</div>
