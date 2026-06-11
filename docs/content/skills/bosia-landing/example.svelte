<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Badge } from "$lib/components/ui/badge";
	import { Separator } from "$lib/components/ui/separator";
	import Feature from "$lib/blocks/cards/feature/block.svelte";
</script>

<main class="min-h-screen bg-background text-foreground">
	<!-- Hero -->
	<section
		class="mx-auto flex max-w-5xl flex-col items-start gap-6 px-6 py-24 sm:items-center sm:text-center"
	>
		<Badge variant="secondary">Now in beta</Badge>
		<h1 class="text-4xl font-semibold tracking-tight sm:text-6xl">
			Ship interfaces, not arguments.
		</h1>
		<p class="max-w-2xl text-lg text-muted-foreground">
			A registry-first build system for Svelte 5 — consistent components, semantic tokens, no design
			drift.
		</p>
		<div class="flex gap-3">
			<Button size="lg">Get started</Button>
			<Button size="lg" variant="outline">View docs</Button>
		</div>
	</section>

	<Separator />

	<!-- Features -->
	<section class="mx-auto max-w-6xl px-6 py-24">
		<h2 class="mb-12 text-3xl font-semibold tracking-tight">What you get</h2>
		<div class="grid gap-6 md:grid-cols-3">
			<Feature
				title="Registry-first"
				body="62 components, 1 block, 2 themes — installed with one command."
			/>
			<Feature title="Semantic tokens" body="Theme swap is a CSS-vars change, not a refactor." />
			<Feature
				title="Runes everywhere"
				body="Svelte 5 reactivity, no legacy stores or $: statements."
			/>
		</div>
	</section>

	<Separator />

	<!-- Social proof -->
	<section class="mx-auto max-w-5xl px-6 py-16">
		<p class="text-center text-sm uppercase tracking-widest text-muted-foreground">
			Trusted by teams shipping production interfaces
		</p>
		<div class="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-70">
			<span class="text-xl font-semibold">acme</span>
			<span class="text-xl font-semibold">orbit</span>
			<span class="text-xl font-semibold">north</span>
			<span class="text-xl font-semibold">field</span>
		</div>
	</section>

	<Separator />

	<!-- CTA -->
	<section class="mx-auto max-w-3xl px-6 py-24 text-center">
		<h2 class="text-3xl font-semibold tracking-tight">Start in minutes.</h2>
		<p class="mt-4 text-muted-foreground">
			Install once. Ship the same primitives across every route.
		</p>
		<Button size="lg" class="mt-8">Get started</Button>
	</section>

	<footer class="border-t border-border">
		<div
			class="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 py-8 sm:flex-row sm:items-center"
		>
			<span class="font-semibold">Bosia</span>
			<nav class="flex gap-6 text-sm text-muted-foreground">
				<a href="/docs">Docs</a>
				<a href="/pricing">Pricing</a>
				<a href="/changelog">Changelog</a>
			</nav>
			<span class="text-sm text-muted-foreground">© 2026 Bosia</span>
		</div>
	</footer>
</main>
