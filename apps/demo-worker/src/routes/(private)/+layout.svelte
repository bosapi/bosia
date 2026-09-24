<script lang="ts">
	let { children }: { children: any } = $props();
</script>

<div class="flex min-h-screen flex-col bg-background text-foreground">
	<header class="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
		<nav class="mx-auto flex max-w-4xl items-center gap-6 px-4 py-3">
			<a href="/" class="font-bold tracking-tight flex items-center gap-2"
				><img src="/favicon.svg" alt="" class="size-5" /> Bosia</a
			>
			<span
				class="text-xs uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400"
			>
				private group
			</span>
			<a
				href="/dedup-demo"
				class="text-sm text-muted-foreground hover:text-foreground transition-colors ml-auto"
				>← Public demo</a
			>
		</nav>
	</header>
	<main class="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
		{@render children()}
	</main>
</div>
