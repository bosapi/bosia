<script lang="ts">
	import { ArrowRight } from "@lucide/svelte";

	const counts = [
		{ n: "02", l: "Days" },
		{ n: "14", l: "Hours" },
		{ n: "37", l: "Minutes" },
	];
</script>

<section
	class="relative w-full overflow-hidden bg-foreground text-background"
	style="min-height:88vh"
>
	<!-- Photo + scrim -->
	<img
		src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=80"
		alt=""
		loading="lazy"
		class="absolute inset-0 h-full w-full object-cover opacity-40"
	/>
	<div
		class="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/60 to-foreground/20"
	></div>

	<div class="relative z-10 flex min-h-[88vh] flex-col">
		<!-- Content -->
		<div class="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-16">
			<div
				class="mb-5 flex items-center gap-3 font-mono text-xs uppercase tracking-wide text-background/70"
			>
				<span class="h-px w-8 bg-background/50"></span> Mid-season · Ends Sunday
			</div>
			<h1
				class="max-w-3xl font-display text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-7xl"
			>
				Up to <span class="text-primary">40% off</span> everything you put off buying.
			</h1>
			<p class="mt-6 max-w-lg text-lg text-background/80">
				The whole archive, marked down. No codes, no minimums — the price you see is the price you
				pay.
			</p>
			<div class="mt-8 flex items-center gap-6">
				{#each counts as c, i (c.l)}
					{#if i > 0}
						<span class="font-display text-4xl font-extrabold text-background/30">:</span>
					{/if}
					<div class="text-center">
						<div class="font-display text-4xl font-extrabold leading-none">{c.n}</div>
						<div class="mt-2 font-mono text-[11px] uppercase tracking-widest text-background/55">
							{c.l}
						</div>
					</div>
				{/each}
			</div>
			<div class="mt-9 flex flex-wrap gap-3.5">
				<button
					type="button"
					class="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition hover:brightness-110"
				>
					Shop the sale <ArrowRight size={19} />
				</button>
				<button
					type="button"
					class="rounded-lg border border-background/30 px-6 py-3 text-base font-semibold text-background hover:bg-background/10"
				>
					Browse new arrivals
				</button>
			</div>
		</div>
	</div>
</section>
