<script lang="ts">
	let count = $state(0);

	const features = [
		{
			icon: "📂",
			label: "File-based routing",
			desc: "+page.svelte, +layout.svelte, route groups, dynamic [params]",
		},
		{
			icon: "⚡",
			label: "SSR + Hydration",
			desc: "Server renders HTML, Svelte hydrates on the client",
		},
		{
			icon: "🔁",
			label: "Server loaders",
			desc: "+page.server.ts and +layout.server.ts with parent() threading",
		},
		{ icon: "🪝", label: "Hooks", desc: "sequence() middleware — auth, logging, locals" },
		{
			icon: "📡",
			label: "API routes",
			desc: "+server.ts exports GET, POST, PUT, PATCH, DELETE",
		},
		{
			icon: "🧩",
			label: "Component registry",
			desc: "bosia add button — shadcn-style, code you own",
		},
		{
			icon: "✨",
			label: "feat system",
			desc: "bosia feat login — scaffold entire features, not just components",
		},
	];
</script>

<svelte:head>
	<title>{{ PROJECT_NAME }}</title>
	<meta name="description" content="{{ PROJECT_NAME }} — SSR + Svelte 5 + Bun + ElysiaJS" />
</svelte:head>

<div class="space-y-12">
	<!-- Hero -->
	<div class="space-y-3 pt-4">
		<h1 class="text-5xl font-bold tracking-tight flex items-center gap-3">
			<img src="/favicon.svg" alt="" class="size-10" />
			{{ PROJECT_NAME }}
		</h1>
		<p class="text-xl text-muted-foreground max-w-xl">
			A minimalist fullstack framework — SSR, Svelte 5 Runes, Bun, and ElysiaJS.
		</p>
	</div>

	<!-- Svelte 5 reactivity demo -->
	<div class="rounded-lg border bg-card p-6 space-y-3 max-w-sm">
		<p class="text-sm font-medium text-muted-foreground">Svelte 5 $state demo</p>
		<p class="text-5xl font-bold tabular-nums">{count}</p>
		<div class="flex gap-2">
			<button
				onclick={() => count++}
				class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
			>
				+1
			</button>
			<button
				onclick={() => (count = 0)}
				class="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
			>
				Reset
			</button>
		</div>
	</div>

	<!-- Features grid -->
	<div class="space-y-4">
		<h2 class="text-2xl font-semibold tracking-tight">Features</h2>
		<div class="grid gap-4 sm:grid-cols-2">
			{#each features as f}
				<div class="rounded-lg border bg-card p-4 space-y-1">
					<p class="font-medium">{f.icon} {f.label}</p>
					<p class="text-sm text-muted-foreground">{f.desc}</p>
				</div>
			{/each}
		</div>
	</div>

	<!-- Navigation demo -->
	<div class="space-y-4">
		<h2 class="text-2xl font-semibold tracking-tight">Routes in this demo</h2>
		<div class="flex flex-wrap gap-2">
			{#each ["/", "/about", "/blog", "/blog/hello-world", "/blog/route-groups", "/all/foo/bar", "/missing-page"] as href}
				<a
					{href}
					class="rounded-md border px-3 py-1.5 text-sm font-mono hover:bg-muted transition-colors"
					>{href}</a
				>
			{/each}
			<a
				href="/api/hello"
				target="_blank"
				class="rounded-md border px-3 py-1.5 text-sm font-mono hover:bg-muted transition-colors"
				>/api/hello ↗</a
			>
		</div>
	</div>
</div>
