<script lang="ts">
	import { MapPin, ArrowRight } from "@lucide/svelte";

	const cuisines = ["Pizza", "Sushi", "Burgers", "Vegan", "Dessert"];

	let address = $state("");
</script>

<section class="relative w-full overflow-hidden bg-background text-foreground">
	<!-- Content -->
	<div
		class="mx-auto grid w-full max-w-6xl items-center gap-10 px-6 py-16 lg:grid-cols-2 lg:gap-14"
	>
		<!-- Copy + search -->
		<div class="max-w-xl">
			<div
				class="mb-5 flex items-center gap-2 font-mono text-xs uppercase tracking-wide text-primary"
			>
				<span class="h-1.5 w-1.5 rounded-full bg-primary"></span> Free delivery this week
			</div>
			<h1 class="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
				Dinner’s sorted in <span class="text-primary">under 30</span> minutes.
			</h1>
			<p class="mt-4 max-w-md text-lg text-muted-foreground">
				Your neighborhood’s best kitchens, delivered hot. Enter your address and watch the magic
				happen.
			</p>
			<div class="mt-6 flex max-w-md gap-2 rounded-xl border border-border bg-card p-1.5 shadow-sm">
				<div class="flex flex-1 items-center gap-2 px-2.5 text-muted-foreground">
					<MapPin size={18} />
					<input
						bind:value={address}
						placeholder="Enter delivery address"
						class="h-11 w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
					/>
				</div>
				<button
					type="button"
					class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
				>
					Find food <ArrowRight size={18} />
				</button>
			</div>
			<div class="mt-5 flex flex-wrap gap-2">
				{#each cuisines as cuisine (cuisine)}
					<span
						class="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-semibold text-foreground"
						>{cuisine}</span
					>
				{/each}
			</div>
		</div>

		<!-- Image + floating dishes -->
		<div class="relative flex items-center">
			<div
				class="relative aspect-square max-h-[31rem] w-full overflow-hidden rounded-2xl bg-muted shadow-lg"
			>
				<img
					src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=900&q=80"
					alt="Pizza"
					loading="lazy"
					class="h-full w-full object-cover"
				/>
			</div>
			<div
				class="absolute -left-3 top-10 flex w-56 items-center gap-3 rounded-xl bg-card p-2.5 text-card-foreground shadow-lg"
			>
				<div class="flex-none overflow-hidden rounded-xl" style="height:3.25rem;width:3.25rem">
					<img
						src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80"
						alt="Garden bowl"
						loading="lazy"
						class="h-full w-full object-cover"
					/>
				</div>
				<div class="flex-1">
					<div class="text-sm font-bold">Garden bowl</div>
					<div class="text-xs text-muted-foreground">Ready in 18 min</div>
				</div>
				<span class="font-display text-sm font-extrabold text-primary">$12</span>
			</div>
			<div
				class="absolute -right-3 bottom-10 flex w-56 items-center gap-3 rounded-xl bg-card p-2.5 text-card-foreground shadow-lg"
			>
				<div class="flex-none overflow-hidden rounded-xl" style="height:3.25rem;width:3.25rem">
					<img
						src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&q=80"
						alt="Smash burger"
						loading="lazy"
						class="h-full w-full object-cover"
					/>
				</div>
				<div class="flex-1">
					<div class="text-sm font-bold">Smash burger</div>
					<div class="text-xs text-muted-foreground">4.8 ★ nearby</div>
				</div>
				<span class="font-display text-sm font-extrabold text-primary">$14</span>
			</div>
		</div>
	</div>
</section>
