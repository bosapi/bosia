<script lang="ts">
	import { Check, ArrowRight } from "@lucide/svelte";

	const bullets = [
		"Fixed-scope engagements, no open-ended retainers",
		"Senior operators, not a deck-and-dash",
		"Outcomes tracked against your KPIs",
	];
	const avatars = [13, 52, 15, 60];
</script>

<section class="relative w-full overflow-hidden bg-background text-foreground">
	<!-- Content -->
	<div
		class="mx-auto grid w-full max-w-6xl items-center gap-10 px-6 py-20 lg:grid-cols-2 lg:gap-14"
	>
		<!-- Copy -->
		<div class="max-w-xl">
			<div
				class="mb-5 flex items-center gap-3 font-mono text-xs uppercase tracking-wide text-primary"
			>
				<span class="h-px w-8 bg-primary/60"></span> Operations &amp; growth advisory
			</div>
			<h1 class="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
				Clarity for the decisions that actually move the number.
			</h1>
			<p class="mt-4 max-w-md text-lg text-muted-foreground">
				We embed with your team to find the 20% of work driving 80% of results — then help you ship
				it.
			</p>
			<div class="mt-6 flex flex-col gap-3">
				{#each bullets as bullet (bullet)}
					<div class="flex items-center gap-2.5 text-base">
						<span
							class="grid flex-none place-items-center rounded-full bg-primary/10 text-primary"
							style="height:1.375rem;width:1.375rem"
						>
							<Check size={14} strokeWidth={2.6} />
						</span>
						{bullet}
					</div>
				{/each}
			</div>
			<div class="mt-7 flex flex-wrap gap-3">
				<button
					type="button"
					class="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition hover:brightness-110"
				>
					Book a discovery call <ArrowRight size={19} />
				</button>
				<button
					type="button"
					class="inline-flex items-center rounded-lg border border-input px-6 py-3 text-base font-semibold transition hover:bg-muted"
				>
					Read case studies
				</button>
			</div>
		</div>

		<!-- Image + stat cards -->
		<div class="relative">
			<div class="aspect-[5/4] w-full overflow-hidden rounded-2xl bg-muted shadow-lg">
				<img
					src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=900&q=80"
					alt="Team"
					loading="lazy"
					class="h-full w-full object-cover"
				/>
			</div>
			<div
				class="absolute -bottom-5 -right-2 flex items-center gap-7 rounded-xl bg-card px-6 py-4 text-card-foreground shadow-xl"
			>
				<div>
					<div class="font-display text-2xl font-extrabold">$1.4B</div>
					<div class="text-xs text-muted-foreground">Value unlocked</div>
				</div>
				<div class="h-11 w-px bg-border"></div>
				<div>
					<div class="font-display text-2xl font-extrabold text-primary">4.2x</div>
					<div class="text-xs text-muted-foreground">Avg. ROI</div>
				</div>
			</div>
			<div
				class="absolute -left-2 -top-4 flex items-center gap-2.5 rounded-xl bg-card px-4 py-3 text-card-foreground shadow-lg"
			>
				<div class="flex -space-x-2">
					{#each avatars as n (n)}
						<img
							src="https://i.pravatar.cc/80?img={n}"
							alt=""
							loading="lazy"
							class="h-7 w-7 rounded-full border-2 border-card object-cover"
						/>
					{/each}
				</div>
				<span class="text-xs text-muted-foreground">60+ partners</span>
			</div>
		</div>
	</div>
</section>
