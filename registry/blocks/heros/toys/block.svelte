<script lang="ts">
	import { Search, ShoppingBag, ArrowRight, Sparkles } from "@lucide/svelte";

	const links = ["By age", "By brand", "Outdoor", "Gifts"];
	const ages = ["0–2 yrs", "3–5 yrs", "6–8 yrs", "9+ yrs"];
	const tiles = [
		{
			label: "Building",
			img: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&q=80",
			big: true,
		},
		{
			label: "Plush",
			img: "https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=600&q=80",
			big: false,
		},
		{
			label: "Outdoor",
			img: "https://images.unsplash.com/photo-1472162072942-cd5147eb3902?w=600&q=80",
			big: false,
		},
		{
			label: "Learning",
			img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80",
			big: false,
		},
	];

	let activeAge = $state(1);
</script>

<section class="relative w-full overflow-hidden bg-background text-foreground">
	<!-- Nav -->
	<header class="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
		<div class="flex items-center gap-2.5">
			<div
				class="grid h-8 w-8 place-items-center rounded-lg bg-primary font-display text-lg font-extrabold text-primary-foreground"
			>
				B
			</div>
			<span class="font-display text-lg font-extrabold tracking-tight">Brand</span>
		</div>
		<nav class="hidden items-center gap-7 md:flex">
			{#each links as link (link)}
				<button
					type="button"
					class="text-sm font-medium text-muted-foreground hover:text-foreground">{link}</button
				>
			{/each}
		</nav>
		<div class="flex items-center gap-2">
			<button
				type="button"
				class="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground sm:inline-flex"
			>
				<Search size={18} /> Search
			</button>
			<button
				type="button"
				class="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
			>
				<ShoppingBag size={18} /> Bag · 2
			</button>
		</div>
	</header>

	<!-- Content -->
	<div
		class="mx-auto grid w-full max-w-6xl items-center gap-10 px-6 pb-16 pt-6 lg:grid-cols-2 lg:gap-12"
	>
		<!-- Copy + age filter -->
		<div class="max-w-xl">
			<div class="mb-5 flex flex-wrap gap-2.5">
				<span
					class="inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"
					>Play that lasts</span
				>
				<span
					class="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground"
				>
					<span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Tested non-toxic
				</span>
			</div>
			<h1 class="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
				Toys built to be <span class="text-primary">played hard</span> with.
			</h1>
			<p class="mt-4 max-w-md text-lg text-muted-foreground">
				Open-ended, screen-free and tough enough for the second kid. Sorted by age so the gift
				always fits.
			</p>
			<div class="mt-6">
				<div class="mb-3 font-mono text-xs uppercase tracking-wide text-muted-foreground/70">
					Shop by age
				</div>
				<div class="flex flex-wrap gap-2.5">
					{#each ages as age, i (age)}
						<button
							type="button"
							onclick={() => (activeAge = i)}
							class="h-10 rounded-full px-4 text-sm font-semibold transition {activeAge === i
								? 'bg-foreground text-background'
								: 'border border-border bg-card text-foreground hover:bg-muted'}"
						>
							{age}
						</button>
					{/each}
				</div>
			</div>
			<div class="mt-6 flex flex-wrap gap-3">
				<button
					type="button"
					class="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition hover:brightness-110"
				>
					Start shopping <ArrowRight size={19} />
				</button>
				<button
					type="button"
					class="inline-flex items-center rounded-lg border border-input px-6 py-3 text-base font-semibold transition hover:bg-muted"
				>
					Gift finder
				</button>
			</div>
		</div>

		<!-- Tile grid -->
		<div class="relative">
			<div class="grid grid-cols-2 gap-4">
				{#each tiles as tile (tile.label)}
					<div
						class="relative overflow-hidden rounded-xl shadow-md {tile.big
							? 'row-span-2 aspect-[3/4]'
							: 'aspect-square'}"
					>
						<img
							src={tile.img}
							alt={tile.label}
							loading="lazy"
							class="absolute inset-0 h-full w-full object-cover"
						/>
						<span
							class="absolute bottom-3 left-3 rounded-full bg-card px-3.5 py-1.5 text-xs font-bold text-card-foreground shadow-sm"
							>{tile.label}</span
						>
					</div>
				{/each}
			</div>
			<div
				class="absolute -bottom-3 -left-3 flex items-center gap-3 rounded-xl bg-card px-4 py-3 text-card-foreground shadow-xl"
			>
				<div class="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
					<Sparkles size={20} />
				</div>
				<div>
					<div class="text-sm font-bold">Free gift wrapping</div>
					<div class="text-xs text-muted-foreground">Add a note at checkout</div>
				</div>
			</div>
		</div>
	</div>
</section>
