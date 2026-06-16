<script lang="ts">
	import { ArrowRight } from "@lucide/svelte";

	const logos = ["Vercel", "Linear", "Notion", "Figma", "Stripe"];

	let email = $state("");
</script>

<section class="relative w-full overflow-hidden bg-background text-foreground">
	<!-- Content -->
	<div class="mx-auto flex w-full max-w-3xl flex-col items-center px-6 pt-16 text-center">
		<span
			class="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
		>
			<span class="h-1.5 w-1.5 rounded-full bg-primary"></span> New · AI-assisted workflows
		</span>
		<h1 class="font-display text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl">
			Ship work, not status updates.
		</h1>
		<p class="mt-5 max-w-xl text-lg text-muted-foreground">
			The project tool your team won’t quietly abandon. Plans, docs, and progress that keep
			themselves up to date.
		</p>
		<div
			class="mt-8 flex w-full max-w-md gap-2 rounded-xl border border-border bg-card p-1.5 shadow-sm"
		>
			<input
				bind:value={email}
				type="email"
				placeholder="you@company.com"
				class="h-11 flex-1 bg-transparent px-3 text-base text-foreground outline-none placeholder:text-muted-foreground"
			/>
			<button
				type="button"
				class="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
			>
				Start free <ArrowRight size={18} />
			</button>
		</div>
		<p class="mt-3 text-sm text-muted-foreground">Free for 14 days · No card required</p>

		<div class="mt-11 flex flex-col items-center gap-4">
			<span class="font-mono text-xs uppercase tracking-widest text-muted-foreground/70"
				>Powering teams at</span
			>
			<div class="flex flex-wrap items-center justify-center gap-8">
				{#each logos as logo (logo)}
					<span class="font-display text-lg font-bold text-muted-foreground/50">{logo}</span>
				{/each}
			</div>
		</div>
	</div>

	<!-- Browser mock -->
	<div class="mx-auto w-full max-w-4xl px-6 pb-16 pt-11">
		<div class="overflow-hidden rounded-xl border border-border bg-card shadow-xl">
			<div class="flex items-center gap-2 border-b border-border bg-muted px-4 py-3">
				<span class="h-3 w-3 rounded-full bg-destructive/70"></span>
				<span class="h-3 w-3 rounded-full bg-amber-400"></span>
				<span class="h-3 w-3 rounded-full bg-emerald-400"></span>
				<div
					class="ml-3 flex h-6 max-w-xs flex-1 items-center rounded-full border border-border bg-card px-3 font-mono text-xs text-muted-foreground/70"
				>
					app.brand.com
				</div>
			</div>
			<img
				src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1400&q=80"
				alt="Product"
				loading="lazy"
				class="block w-full"
			/>
		</div>
	</div>
</section>
