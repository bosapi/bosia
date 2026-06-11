<script lang="ts">
	import { ShoppingBag, Sparkles, Heart, Check, Truck } from "@lucide/svelte";

	const links = ["Totes", "Backpacks", "Travel", "Our craft"];
	const specs = [
		{ icon: Sparkles, label: "Full-grain leather", sub: "Tanned in Tuscany" },
		{ icon: Heart, label: "Hand-stitched", sub: "1 of 200 made" },
		{ icon: Check, label: "Lifetime repairs", sub: "Free, forever" },
		{ icon: Truck, label: "Ships in a day", sub: "Carbon-neutral" },
	];
</script>

<section class="relative w-full overflow-hidden bg-foreground text-background">
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
				<button type="button" class="text-sm font-medium text-background/80 hover:text-background"
					>{link}</button
				>
			{/each}
		</nav>
		<button
			type="button"
			class="rounded-lg border border-background/30 px-4 py-2 text-sm font-semibold text-background hover:bg-background/10"
			>Cart · 1</button
		>
	</header>

	<!-- Content -->
	<div
		class="mx-auto grid w-full max-w-6xl items-center gap-10 px-6 pb-16 pt-6 lg:grid-cols-2 lg:gap-12"
	>
		<!-- Copy -->
		<div class="max-w-xl">
			<div
				class="mb-5 flex items-center gap-3 font-mono text-xs uppercase tracking-wide text-primary"
			>
				<span class="h-px w-8 bg-primary/60"></span> The Carryall · Numbered run
			</div>
			<h1 class="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
				A bag that <span class="text-primary">outlives</span> the trend.
			</h1>
			<p class="mt-4 max-w-md text-lg text-background/75">
				Cut from a single hide of full-grain Italian leather and hand-stitched to last decades. It
				only looks better with the miles.
			</p>
			<div class="mt-6 flex items-baseline gap-3.5">
				<span class="font-display text-3xl font-extrabold">$385</span>
				<span class="text-background/50">or 4 × $96 interest-free</span>
			</div>
			<div class="mt-7 flex flex-wrap gap-3">
				<button
					type="button"
					class="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition hover:brightness-110"
				>
					<ShoppingBag size={19} /> Add to cart
				</button>
				<button
					type="button"
					class="rounded-lg border border-background/30 px-6 py-3 text-base font-semibold text-background hover:bg-background/10"
				>
					See the leather
				</button>
			</div>
			<div class="mt-9 grid max-w-md grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
				{#each specs as spec (spec.label)}
					{@const Icon = spec.icon}
					<div class="flex items-center gap-3">
						<div
							class="grid h-10 w-10 flex-none place-items-center rounded-xl bg-primary/15 text-primary"
						>
							<Icon size={20} />
						</div>
						<div>
							<div class="text-sm font-bold">{spec.label}</div>
							<div class="text-xs text-background/55">{spec.sub}</div>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Product -->
		<div class="relative flex items-center justify-center">
			<div
				class="relative aspect-[4/5] w-full max-w-md overflow-hidden rounded-2xl border border-background/15 shadow-xl"
			>
				<img
					src="https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=900&q=80"
					alt="Leather bag"
					loading="lazy"
					class="h-full w-full object-cover"
				/>
			</div>
			<div
				class="absolute -left-2 bottom-10 flex items-center gap-3 rounded-xl bg-card px-4 py-3 text-card-foreground shadow-xl"
			>
				<div class="font-display text-2xl font-extrabold text-primary">No. 137</div>
				<div class="border-l border-border pl-3">
					<div class="text-sm font-bold">Your edition</div>
					<div class="text-xs text-muted-foreground">Stamped to order</div>
				</div>
			</div>
		</div>
	</div>
</section>
