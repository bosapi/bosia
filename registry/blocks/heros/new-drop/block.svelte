<script lang="ts">
	import { ShoppingBag, Star } from "@lucide/svelte";

	const sizes = ["XS", "S", "M", "L", "XL"];

	let activeSize = $state(2);
</script>

<section class="relative w-full overflow-hidden bg-background text-foreground">
	<!-- Content -->
	<div
		class="mx-auto grid w-full max-w-6xl items-center gap-10 px-6 py-16 lg:grid-cols-2 lg:gap-12"
	>
		<!-- Copy -->
		<div class="max-w-xl">
			<div
				class="mb-5 flex items-center gap-3 font-mono text-xs uppercase tracking-wide text-primary"
			>
				<span class="h-px w-8 bg-primary/60"></span> The new drop · 24 pieces
			</div>
			<h1 class="font-display text-4xl font-bold tracking-tight sm:text-5xl">
				The overcoat, reimagined in camel wool.
			</h1>
			<p class="mt-4 max-w-md text-lg text-muted-foreground">
				Double-faced Italian wool, raglan shoulder, horn buttons. Made in limited numbers — once
				it’s gone, it’s gone.
			</p>
			<div class="mt-6 flex items-center gap-3.5">
				<span class="font-display text-3xl font-extrabold">$480</span>
				<span class="flex items-center gap-1.5 text-sm text-muted-foreground">
					<Star size={15} class="fill-amber-500 text-amber-500" />
					<span class="font-semibold text-foreground">4.9</span> 86 reviews
				</span>
			</div>
			<div class="mt-6">
				<div class="mb-2.5 font-mono text-xs uppercase tracking-wide text-muted-foreground/70">
					Select size
				</div>
				<div class="flex gap-2">
					{#each sizes as size, i (size)}
						<button
							type="button"
							onclick={() => (activeSize = i)}
							class="grid h-11 w-11 place-items-center rounded-md text-sm font-semibold transition {activeSize ===
							i
								? 'bg-foreground text-background'
								: 'border border-border hover:bg-muted'}"
						>
							{size}
						</button>
					{/each}
				</div>
			</div>
			<div class="mt-7 flex flex-wrap gap-3">
				<button
					type="button"
					class="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-6 py-3 text-base font-semibold text-secondary-foreground transition hover:bg-muted"
				>
					<ShoppingBag size={18} /> Add to bag
				</button>
				<button
					type="button"
					class="inline-flex items-center rounded-lg border border-input px-6 py-3 text-base font-semibold transition hover:bg-muted"
				>
					Book a fitting
				</button>
			</div>
		</div>

		<!-- Product -->
		<div class="relative flex items-center">
			<div
				class="relative aspect-[4/5] max-h-[34rem] w-full overflow-hidden rounded-2xl bg-muted shadow-lg"
			>
				<img
					src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=900&q=80"
					alt="Coat"
					loading="lazy"
					class="h-full w-full object-cover"
				/>
				<span
					class="absolute left-4 top-4 inline-flex items-center rounded-full bg-foreground px-3 py-1 text-xs font-semibold text-background"
					>Just dropped</span
				>
			</div>
		</div>
	</div>
</section>
