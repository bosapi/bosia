<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Card, CardContent } from "$lib/components/ui/card";
	import { Badge } from "$lib/components/ui/badge";
	import { Separator } from "$lib/components/ui/separator";
	import { Avatar, AvatarFallback } from "$lib/components/ui/avatar";
	import FeatureEditorial from "$lib/components/blocks/cards/feature-editorial.svelte";

	const features = [
		{
			title: "Registry-first",
			body: "Install primitives with one command — they share tokens, a11y, and updates.",
		},
		{ title: "Semantic tokens", body: "Theme swap is a CSS-vars change, not a refactor." },
		{ title: "Runes everywhere", body: "Svelte 5 reactivity by default — no legacy stores." },
		{
			title: "Type-safe routes",
			body: "File-based routing with Elysia handlers and inferred params.",
		},
		{
			title: "Drizzle wired",
			body: "Schemas, migrations, idempotent seeds — one feature folder.",
		},
		{ title: "RBAC built in", body: "Permission-based authorization; roles are pure DB data." },
	];
</script>

<main class="min-h-screen bg-background text-foreground">
	<!-- Hero -->
	<section
		class="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 py-24 md:flex-row md:items-center"
	>
		<div class="flex-1 space-y-6">
			<Badge variant="secondary">v1.0 — now in beta</Badge>
			<h1 class="text-4xl font-semibold tracking-tight sm:text-6xl">
				Ship interfaces, not arguments.
			</h1>
			<p class="max-w-xl text-lg text-muted-foreground">
				Bosia is a registry-first build system for Svelte 5 — consistent components,
				semantic tokens, RBAC, and Drizzle, with zero design drift.
			</p>
			<div class="flex gap-3">
				<Button size="lg">Get started</Button>
				<Button size="lg" variant="outline">Read the docs</Button>
			</div>
		</div>
		<div class="flex-1">
			<div class="aspect-video rounded-xl border border-border bg-muted" aria-hidden="true" />
		</div>
	</section>

	<!-- Logo row -->
	<section class="mx-auto max-w-5xl px-6 py-8">
		<p class="text-center text-xs uppercase tracking-widest text-muted-foreground">
			Trusted by teams shipping production interfaces
		</p>
		<div class="mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-4 opacity-70">
			<span class="text-lg font-semibold">acme</span>
			<span class="text-lg font-semibold">orbit</span>
			<span class="text-lg font-semibold">north</span>
			<span class="text-lg font-semibold">field</span>
			<span class="text-lg font-semibold">stone</span>
		</div>
	</section>

	<Separator />

	<!-- Features -->
	<section id="features" class="mx-auto max-w-6xl px-6 py-24">
		<h2 class="mb-12 text-3xl font-semibold tracking-tight">What you get</h2>
		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each features as f}
				<FeatureEditorial title={f.title} body={f.body} />
			{/each}
		</div>
	</section>

	<Separator />

	<!-- Testimonials -->
	<section class="mx-auto max-w-5xl px-6 py-24">
		<h2 class="mb-12 text-3xl font-semibold tracking-tight">From people shipping today</h2>
		<div class="grid gap-6 md:grid-cols-2">
			<Card>
				<CardContent class="space-y-4 p-6">
					<p class="text-card-foreground">
						"Cut our build time in half. The registry pattern is what shadcn always
						wanted to be."
					</p>
					<div class="flex items-center gap-3">
						<Avatar><AvatarFallback>AR</AvatarFallback></Avatar>
						<div class="text-sm">
							<div class="font-medium">Anna Reyes</div>
							<div class="text-muted-foreground">Staff Engineer, Orbit</div>
						</div>
					</div>
				</CardContent>
			</Card>
			<Card>
				<CardContent class="space-y-4 p-6">
					<p class="text-card-foreground">
						"Theme swap took twenty minutes. We've been chasing that for two years."
					</p>
					<div class="flex items-center gap-3">
						<Avatar><AvatarFallback>MC</AvatarFallback></Avatar>
						<div class="text-sm">
							<div class="font-medium">Marcus Chen</div>
							<div class="text-muted-foreground">Design Lead, Field</div>
						</div>
					</div>
				</CardContent>
			</Card>
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
				<a href="#features">Features</a>
				<a href="/pricing">Pricing</a>
				<a href="/docs">Docs</a>
				<a href="/changelog">Changelog</a>
			</nav>
			<span class="text-sm text-muted-foreground">© 2026 Bosia</span>
		</div>
	</footer>
</main>
