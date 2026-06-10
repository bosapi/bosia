<script lang="ts">
	import type { PageData } from "./$types";
	import Button from "$components/ui/button/button.svelte";

	let { data }: { data: PageData } = $props();

	let parallelResult = $state<string | null>(null);
	let busy = $state(false);

	async function fireParallel() {
		busy = true;
		parallelResult = null;
		const fetches = Array.from({ length: 5 }, () =>
			fetch("/__bosia/data/dedup-demo-private").then((r) => r.json()),
		);
		const results = await Promise.all(fetches);
		const counts = results.map((r) => r.pageData.count);
		const loadedAts = new Set(results.map((r) => r.pageData.loadedAt));
		parallelResult = `5 parallel requests → counter values: [${counts.join(
			", ",
		)}], unique loadedAt timestamps: ${loadedAts.size}`;
		busy = false;
	}
</script>

<svelte:head>
	<title>Private dedup demo</title>
</svelte:head>

<div class="space-y-6">
	<div class="space-y-2">
		<h1 class="text-3xl font-bold tracking-tight">Private dedup demo</h1>
		<p class="text-muted-foreground">
			This route lives under <code class="font-mono">(private)</code> — so the loader runs
			<strong>per request</strong>, never shared. Required for any per-user data (cookies, session).
		</p>
	</div>

	<div class="rounded-lg border bg-card p-6 space-y-2">
		<p class="text-sm text-muted-foreground">Loader counter (this request)</p>
		<p class="text-5xl font-bold tabular-nums">#{data.count}</p>
		<p class="text-xs text-muted-foreground font-mono">loadedAt: {data.loadedAt}</p>
	</div>

	<div class="rounded-lg border bg-card p-6 space-y-3">
		<p class="font-medium">Fire 5 parallel data fetches</p>
		<p class="text-sm text-muted-foreground">
			Expected: each request runs its own loader. Counter advances by 5; 5 distinct
			<code class="font-mono">loadedAt</code> timestamps.
		</p>
		<Button onclick={fireParallel} disabled={busy}>
			{busy ? "Loading…" : "Fire 5 parallel"}
		</Button>
		{#if parallelResult}
			<p class="text-sm font-mono p-3 bg-muted rounded">{parallelResult}</p>
		{/if}
	</div>

	<div class="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
		Compare with <a href="/dedup-demo" class="underline">/dedup-demo</a>
		— same loader, but no <code class="font-mono">(private)</code> group means responses are shared.
	</div>
</div>
