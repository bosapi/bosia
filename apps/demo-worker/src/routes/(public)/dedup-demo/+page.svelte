<script lang="ts">
	import type { PageData } from "./$types";
	import Button from "$components/ui/button/button.svelte";

	let { data }: { data: PageData } = $props();

	let sameResult = $state<string | null>(null);
	let diffResult = $state<string | null>(null);
	let coalesceResult = $state<string | null>(null);
	let busy = $state(false);

	// Identity = hash of CACHE_KEYS cookies/headers. `Authorization` is in the
	// default list, so one browser can simulate N users by varying the header.
	async function fireParallel(auth: (i: number) => string) {
		const results = await Promise.all(
			Array.from({ length: 5 }, (_, i) =>
				fetch("/__bosia/data/dedup-demo", { headers: { Authorization: auth(i) } }).then((r) =>
					r.json(),
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

	async function fireColdCacheParallel() {
		busy = true;
		coalesceResult = null;
		// Fresh query string → guaranteed cold cache key for this round.
		const url = `/dedup-demo?run=${Date.now()}`;
		const responses = await Promise.all(Array.from({ length: 5 }, () => fetch(url)));
		const hits = responses.filter((r) => r.headers.get("X-Bosia-Cache") === "HIT").length;
		coalesceResult = `5 parallel SSR requests to a cold key → ${5 - hits} built the page, ${hits} served from cache`;
		busy = false;
	}
</script>

<svelte:head>
	<title>Identity-aware dedup demo</title>
</svelte:head>

<div class="space-y-6">
	<div class="space-y-2">
		<h1 class="text-3xl font-bold tracking-tight">Identity-aware dedup demo</h1>
		<p class="text-muted-foreground">
			Concurrent identical requests share <strong>one</strong> in-flight loader — but only within
			the same identity. Identity is a hash of the cookies/headers named in
			<code class="font-mono">CACHE_KEYS</code>, so different users never share a result.
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
			All 5 send <code class="font-mono">Authorization: Bearer alice</code>. Expected: one shared
			loader run — counter advances by <strong>1</strong>, one unique
			<code class="font-mono">loadedAt</code>.
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
			Each sends its own <code class="font-mono">Authorization: Bearer user-N</code>. Expected:
			separate loader runs — counter advances by <strong>5</strong>, five unique
			<code class="font-mono">loadedAt</code> timestamps. No cross-user sharing.
		</p>
		<Button onclick={fireDifferentIdentities} disabled={busy}>
			{busy ? "Loading…" : "Fire 5 as five users"}
		</Button>
		{#if diffResult}
			<p class="text-sm font-mono p-3 bg-muted rounded">{diffResult}</p>
		{/if}
	</div>

	<div class="rounded-lg border bg-card p-6 space-y-3">
		<p class="font-medium">Miss coalescing — 5 parallel SSR requests, cold cache</p>
		<p class="text-sm text-muted-foreground">
			5 parallel requests to this page with a fresh query string (never cached). Expected: the first
			miss builds the page once; the other 4 wait and get
			<code class="font-mono">X-Bosia-Cache: HIT</code>.
		</p>
		<Button onclick={fireColdCacheParallel} disabled={busy}>
			{busy ? "Loading…" : "Fire 5 at a cold cache key"}
		</Button>
		{#if coalesceResult}
			<p class="text-sm font-mono p-3 bg-muted rounded">{coalesceResult}</p>
		{/if}
	</div>

	<div class="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
		Compare with <a href="/dedup-demo-private" class="underline">/dedup-demo-private</a>
		— same simulation under a <code class="font-mono">(private)</code> group, which is now an ordinary
		route group: the results are identical.
	</div>
</div>
