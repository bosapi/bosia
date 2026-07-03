<script lang="ts">
	import type { PageData } from "./$types";
	import Button from "$components/ui/button/button.svelte";

	let { data }: { data: PageData } = $props();

	let sameResult = $state<string | null>(null);
	let diffResult = $state<string | null>(null);
	let busy = $state(false);

	async function fireParallel(auth: (i: number) => string) {
		const results = await Promise.all(
			Array.from({ length: 5 }, (_, i) =>
				fetch("/__bosia/data/dedup-demo-private", { headers: { Authorization: auth(i) } }).then(
					(r) => r.json(),
				),
			),
		);
		const counts = results.map((r) => r.pageData.count);
		const loadedAts = new Set(results.map((r) => r.pageData.loadedAt));
		return `counter values: [${counts.join(", ")}], unique loadedAt timestamps: ${loadedAts.size}`;
	}

	async function fireSameIdentity() {
		busy = true;
		sameResult = null;
		sameResult = await fireParallel(() => "Bearer alice");
		busy = false;
	}

	async function fireDifferentIdentities() {
		busy = true;
		diffResult = null;
		diffResult = await fireParallel((i) => `Bearer user-${i}`);
		busy = false;
	}
</script>

<svelte:head>
	<title>(private) group dedup demo</title>
</svelte:head>

<div class="space-y-6">
	<div class="space-y-2">
		<h1 class="text-3xl font-bold tracking-tight">(private) group dedup demo</h1>
		<p class="text-muted-foreground">
			This route lives under <code class="font-mono">(private)</code> — which is now an
			<strong>ordinary route group</strong>: invisible in the URL, no effect on dedup. Per-user
			isolation comes from the <code class="font-mono">CACHE_KEYS</code> identity instead, so the behavior
			here is identical to the public demo.
		</p>
	</div>

	<div class="rounded-lg border bg-card p-6 space-y-2">
		<p class="text-sm text-muted-foreground">Loader counter (this request)</p>
		<p class="text-5xl font-bold tabular-nums">#{data.count}</p>
		<p class="text-xs text-muted-foreground font-mono">loadedAt: {data.loadedAt}</p>
	</div>

	<div class="rounded-lg border bg-card p-6 space-y-3">
		<p class="font-medium">5 parallel fetches — same identity</p>
		<p class="text-sm text-muted-foreground">
			Expected: one shared loader run — counter advances by <strong>1</strong>, one unique
			<code class="font-mono">loadedAt</code>. Same as the public route.
		</p>
		<Button onclick={fireSameIdentity} disabled={busy}>
			{busy ? "Loading…" : "Fire 5 as one user"}
		</Button>
		{#if sameResult}
			<p class="text-sm font-mono p-3 bg-muted rounded">{sameResult}</p>
		{/if}
	</div>

	<div class="rounded-lg border bg-card p-6 space-y-3">
		<p class="font-medium">5 parallel fetches — five different identities</p>
		<p class="text-sm text-muted-foreground">
			Expected: separate loader runs — counter advances by <strong>5</strong>, five unique
			<code class="font-mono">loadedAt</code> timestamps. Users never share a result.
		</p>
		<Button onclick={fireDifferentIdentities} disabled={busy}>
			{busy ? "Loading…" : "Fire 5 as five users"}
		</Button>
		{#if diffResult}
			<p class="text-sm font-mono p-3 bg-muted rounded">{diffResult}</p>
		{/if}
	</div>

	<div class="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
		Compare with <a href="/dedup-demo" class="underline">/dedup-demo</a>
		— same simulation on a public route, plus a miss-coalescing demo.
	</div>
</div>
