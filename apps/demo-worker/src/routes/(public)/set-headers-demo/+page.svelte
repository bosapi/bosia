<script lang="ts">
	import type { PageData } from "./$types";
	import Button from "$components/ui/button/button.svelte";

	let { data }: { data: PageData } = $props();

	let ssrResult = $state<string | null>(null);
	let dataResult = $state<string | null>(null);
	let busy = $state(false);

	function pickHeaders(r: Response) {
		return ["cache-control", "x-demo-header"]
			.map((h) => `${h}: ${r.headers.get(h) ?? "(missing)"}`)
			.join("\n");
	}

	async function fetchSsrPage() {
		busy = true;
		ssrResult = null;
		const r = await fetch(`/set-headers-demo?run=${Date.now()}`);
		ssrResult = pickHeaders(r);
		busy = false;
	}

	async function fetchDataEndpoint() {
		busy = true;
		dataResult = null;
		const r = await fetch("/__bosia/data/set-headers-demo");
		dataResult = pickHeaders(r);
		busy = false;
	}
</script>

<svelte:head>
	<title>setHeaders demo</title>
</svelte:head>

<div class="space-y-6">
	<div class="space-y-2">
		<h1 class="text-3xl font-bold tracking-tight">setHeaders demo</h1>
		<p class="text-muted-foreground">
			This page's loader calls
			<code class="font-mono"
				>setHeaders(&#123; "cache-control": "public, max-age=60", "x-demo-header": "set-from-loader"
				&#125;)</code
			>. Both headers should appear on the SSR HTML response and the
			<code class="font-mono">/__bosia/data/</code> JSON response.
		</p>
	</div>

	<div class="rounded-lg border bg-card p-6 space-y-2">
		<p class="text-sm text-muted-foreground">Loader ran at</p>
		<p class="text-xl font-bold font-mono">{data.loadedAt}</p>
	</div>

	<div class="rounded-lg border bg-card p-6 space-y-3">
		<p class="font-medium">SSR HTML response headers</p>
		<p class="text-sm text-muted-foreground">
			Fetches this page with a fresh query string (cold cache key). Expected: both loader-set
			headers present.
		</p>
		<Button onclick={fetchSsrPage} disabled={busy}>
			{busy ? "Loading…" : "Fetch SSR page"}
		</Button>
		{#if ssrResult}
			<pre class="text-sm font-mono p-3 bg-muted rounded whitespace-pre-wrap">{ssrResult}</pre>
		{/if}
	</div>

	<div class="rounded-lg border bg-card p-6 space-y-3">
		<p class="font-medium">Data endpoint response headers</p>
		<p class="text-sm text-muted-foreground">
			Fetches <code class="font-mono">/__bosia/data/set-headers-demo</code>. Expected: the loader's
			<code class="font-mono">cache-control</code> wins over the computed default (this loader reads
			no cookies), and <code class="font-mono">x-demo-header</code> rides along.
		</p>
		<Button onclick={fetchDataEndpoint} disabled={busy}>
			{busy ? "Loading…" : "Fetch data endpoint"}
		</Button>
		{#if dataResult}
			<pre class="text-sm font-mono p-3 bg-muted rounded whitespace-pre-wrap">{dataResult}</pre>
		{/if}
	</div>

	<div class="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
		Or from a terminal:
		<code class="font-mono block mt-2"
			>curl -i http://localhost:3000/set-headers-demo | head -20</code
		>
		<code class="font-mono block"
			>curl -i http://localhost:3000/__bosia/data/set-headers-demo | head -20</code
		>
	</div>
</div>
