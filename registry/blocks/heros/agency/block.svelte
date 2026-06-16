<script lang="ts">
	import { ArrowUpRight } from "@lucide/svelte";

	const logos = ["MERIDIAN", "Northwind", "OAK & CO", "Lumen", "Frame"];
</script>

<section
	class="relative w-full overflow-hidden bg-foreground text-background"
	style="min-height:88vh"
>
	<!-- Glow accent -->
	<div
		class="pointer-events-none absolute -right-[10%] -top-[20%] h-[620px] w-[620px] rounded-full bg-primary/30 blur-3xl"
		aria-hidden="true"
	></div>

	<div class="relative z-10 flex min-h-[88vh] flex-col">
		<!-- Content -->
		<div class="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-16">
			<div
				class="mb-6 flex items-center gap-3 font-mono text-xs uppercase tracking-wide text-primary"
			>
				<span class="h-px w-8 bg-primary/60"></span> Brand · Product · Digital
			</div>
			<h1
				class="max-w-3xl font-display text-5xl font-extrabold leading-[0.98] tracking-tight sm:text-7xl"
			>
				We build brands that <span class="text-primary">refuse</span> to blend in.
			</h1>
			<p class="mt-6 max-w-lg text-lg text-background/80">
				A small studio for ambitious teams. Strategy, identity, and product design — shipped end to
				end, no handoffs lost in translation.
			</p>
			<div class="mt-9 flex flex-wrap gap-3.5">
				<button
					type="button"
					class="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition hover:brightness-110"
				>
					Start a project <ArrowUpRight size={19} />
				</button>
				<button
					type="button"
					class="rounded-lg border border-background/30 px-6 py-3 text-base font-semibold text-background hover:bg-background/10"
				>
					See our work
				</button>
			</div>
			<div class="mt-14 flex flex-wrap items-center gap-10">
				<span class="font-mono text-xs uppercase tracking-widest text-background/40"
					>Trusted by</span
				>
				<div class="flex flex-wrap items-center gap-9">
					{#each logos as logo (logo)}
						<span class="font-display text-base font-bold text-background/60">{logo}</span>
					{/each}
				</div>
			</div>
		</div>
	</div>
</section>
