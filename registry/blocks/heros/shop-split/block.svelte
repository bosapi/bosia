<script lang="ts">
	import { Search, ShoppingBag, Truck, Star } from "@lucide/svelte";

	const links = ["Shop", "Collections", "Journal", "About"];
	const avatars = [11, 32, 45, 8];
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
				class="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground"
			>
				<ShoppingBag size={18} /> Cart · 2
			</button>
		</div>
	</header>

	<!-- Content -->
	<div
		class="mx-auto grid w-full max-w-6xl items-center gap-10 px-6 pb-16 pt-6 lg:grid-cols-2 lg:gap-12"
	>
		<!-- Copy -->
		<div class="max-w-xl">
			<div class="mb-5 flex flex-wrap gap-2.5">
				<span
					class="inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"
					>New season</span
				>
				<span
					class="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground"
				>
					<span class="h-1.5 w-1.5 rounded-full bg-current"></span> Limited run
				</span>
			</div>
			<h1 class="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
				Sound that <span class="text-primary">disappears</span> into the music.
			</h1>
			<p class="mt-4 max-w-md text-lg text-muted-foreground">
				Studio-grade headphones tuned by people who actually listen. 40-hour battery, adaptive noise
				floor, featherweight build.
			</p>
			<div class="mt-6 flex items-baseline gap-3.5">
				<span class="font-display text-3xl font-extrabold">$249</span>
				<span class="text-lg text-muted-foreground/70 line-through">$320</span>
				<span
					class="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary"
					>Save 22%</span
				>
			</div>
			<div class="mt-6 flex flex-wrap gap-3">
				<button
					type="button"
					class="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition hover:brightness-110"
				>
					<ShoppingBag size={19} /> Add to bag
				</button>
				<button
					type="button"
					class="inline-flex items-center rounded-lg border border-input px-6 py-3 text-base font-semibold transition hover:bg-muted"
				>
					View details
				</button>
			</div>
			<div class="mt-7 flex flex-wrap items-center gap-7">
				<div class="flex items-center gap-2">
					<div class="flex">
						{#each Array(5) as _, i (i)}
							<Star size={15} class="fill-amber-500 text-amber-500" />
						{/each}
					</div>
					<span class="text-sm font-semibold">4.9</span>
					<span class="text-sm text-muted-foreground">2,431 reviews</span>
				</div>
				<div class="flex items-center gap-3">
					<div class="flex -space-x-2.5">
						{#each avatars as n (n)}
							<img
								src="https://i.pravatar.cc/80?img={n}"
								alt=""
								loading="lazy"
								class="h-8 w-8 rounded-full border-2 border-background object-cover"
							/>
						{/each}
					</div>
					<span class="text-sm text-muted-foreground">Loved by 30k listeners</span>
				</div>
			</div>
		</div>

		<!-- Product -->
		<div class="relative flex items-center justify-center">
			<div
				class="relative aspect-[4/5] w-full max-w-md overflow-hidden rounded-2xl bg-muted shadow-lg"
			>
				<img
					src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&q=80"
					alt="Headphones"
					loading="lazy"
					class="h-full w-full object-cover"
				/>
			</div>
			<div
				class="absolute -left-2 bottom-10 flex items-center gap-3 rounded-xl bg-card px-4 py-3 text-card-foreground shadow-lg"
			>
				<div class="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
					<Truck size={20} />
				</div>
				<div>
					<div class="text-sm font-bold">Free 2-day shipping</div>
					<div class="text-xs text-muted-foreground">On orders over $99</div>
				</div>
			</div>
			<div
				class="absolute right-2 top-8 rounded-full bg-foreground px-4 py-2 font-mono text-xs tracking-wide text-background shadow-md"
			>
				40h battery
			</div>
		</div>
	</div>
</section>
