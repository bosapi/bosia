<script lang="ts">
	import DocsNavbar from "$lib/components/DocsNavbar.svelte";
	import { Button } from "$registry/button";

	let { data }: { data: any } = $props();
</script>

<div class="min-h-screen flex flex-col">
	<DocsNavbar
		version={data.version}
		locale={data.locale}
		switchLocaleUrl={data.switchLocaleUrl}
	/>

	<!-- Hero -->
	<section class="flex-1 px-4 py-24 sm:py-32 text-center">
		<div class="mx-auto max-w-3xl space-y-6">
			<div
				class="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground mb-2"
			>
				{data.version} — Now available
			</div>
			<h1 class="text-5xl sm:text-6xl font-bold tracking-tight leading-tight">
				The fullstack framework<br />for <span class="text-primary">Bun + Svelte</span>
			</h1>
			<p class="text-xl text-muted-foreground max-w-xl mx-auto">
				Build production-ready web apps with file-based routing, streaming SSR, and a
				built-in component registry.
			</p>
			<div class="flex flex-wrap gap-3 justify-center pt-2">
				<a href="/getting-started">
					<Button size="lg">Get Started →</Button>
				</a>
				<a href="/components/overview">
					<Button variant="outline" size="lg">Browse Components</Button>
				</a>
			</div>
			<!-- Quick install -->
			<div
				class="mt-8 inline-flex items-center gap-2 rounded-lg border border-border bg-muted px-4 py-2 font-mono text-sm text-muted-foreground"
			>
				<span class="text-primary select-none">$</span>
				<span class="select-all">bun create bosia my-app</span>
			</div>
		</div>
	</section>

	<!-- Features -->
	<section class="px-4 py-20 border-t border-border">
		<div class="mx-auto max-w-5xl">
			<h2 class="text-3xl font-bold text-center mb-4">Everything you need</h2>
			<p class="text-center text-muted-foreground mb-12">
				A complete framework with batteries included.
			</p>
			<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each [{ icon: "⚡", title: "Bun-powered", desc: "Instant dev server, fast builds, and a single runtime for everything." }, { icon: "🎯", title: "File-based routing", desc: "+page.svelte, +layout.svelte, +server.ts — just like SvelteKit." }, { icon: "🌊", title: "Streaming SSR", desc: "Render HTML as it streams with non-blocking metadata and layouts." }, { icon: "🔒", title: "Secure by default", desc: "CSRF protection, XSS escaping, and security headers — zero config." }, { icon: "🧩", title: "Component registry", desc: "Add shadcn-style components with `bosia add button`." }, { icon: "📐", title: "TypeScript first", desc: "Auto-generated PageData and LayoutData types for every route." }] as f}
					<div class="rounded-lg border border-border p-5 space-y-2">
						<div class="text-2xl">{f.icon}</div>
						<h3 class="font-semibold">{f.title}</h3>
						<p class="text-sm text-muted-foreground">{f.desc}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Quick Start -->
	<section class="px-4 py-20 border-t border-border bg-muted/30">
		<div class="mx-auto max-w-3xl">
			<h2 class="text-3xl font-bold text-center mb-12">Get started in seconds</h2>
			<div class="space-y-4">
				{#each [{ step: "1", label: "Create a new project", code: "bun create bosia my-app" }, { step: "2", label: "Start the dev server", code: "cd my-app && bun run dev" }, { step: "3", label: "Add a component", code: "bosia add button" }] as s}
					<div class="flex gap-4 items-start">
						<div
							class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold"
						>
							{s.step}
						</div>
						<div class="flex-1 space-y-1">
							<p class="text-sm font-medium">{s.label}</p>
							<div
								class="rounded-md bg-background border border-border px-4 py-2 font-mono text-sm text-muted-foreground"
							>
								<span class="text-primary select-none">$ </span>{s.code}
							</div>
						</div>
					</div>
				{/each}
			</div>
			<div class="text-center mt-8">
				<a
					href="/getting-started"
					class="text-sm text-primary hover:underline underline-offset-4"
				>
					Read the full getting started guide →
				</a>
			</div>
		</div>
	</section>

	<!-- Tech Stack -->
	<section class="px-4 py-20 border-t border-border">
		<div class="mx-auto max-w-3xl text-center space-y-12">
			<div>
				<h2 class="text-3xl font-bold mb-4">Built on proven foundations</h2>
				<p class="text-muted-foreground">
					Bosia is a thin, opinionated layer on top of tools you already love.
				</p>
			</div>
			<div class="grid sm:grid-cols-3 gap-8">
				{#each [{ name: "Bun", role: "Runtime & bundler", url: "https://bun.sh" }, { name: "Svelte 5", role: "UI with runes", url: "https://svelte.dev" }, { name: "ElysiaJS", role: "HTTP server", url: "https://elysiajs.com" }] as t}
					<a
						href={t.url}
						target="_blank"
						rel="noopener"
						class="group rounded-lg border border-border p-6 text-center hover:border-primary transition-colors"
					>
						<div class="text-xl font-bold group-hover:text-primary transition-colors">
							{t.name}
						</div>
						<div class="text-sm text-muted-foreground mt-1">{t.role}</div>
					</a>
				{/each}
			</div>
		</div>
	</section>

	<!-- CTA -->
	<section class="px-4 py-20 border-t border-border text-center">
		<div class="mx-auto max-w-xl space-y-4">
			<h2 class="text-3xl font-bold">Ready to build?</h2>
			<p class="text-muted-foreground">Start your first Bosia project today.</p>
			<div class="flex gap-3 justify-center pt-2">
				<a href="/getting-started"><Button size="lg">Get Started</Button></a>
				<a href="https://github.com/bosapi/bosia" target="_blank" rel="noopener">
					<Button variant="outline" size="lg">GitHub</Button>
				</a>
			</div>
		</div>
	</section>

	<footer class="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground">
		Built with Bosia · <a
			href="/reference/changelog"
			class="hover:text-foreground transition-colors">{data.version}</a
		>
	</footer>
</div>
