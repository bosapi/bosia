<script lang="ts">
	import { ArrowRight, ShoppingBag } from "@lucide/svelte";

	const links = ["Living", "Kitchen", "Bedroom", "Lighting"];
</script>

<section
	class="relative w-full overflow-hidden bg-foreground text-background"
	style="min-height:88vh"
>
	<!-- Photo + scrim -->
	<img
		src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1600&q=80"
		alt=""
		loading="lazy"
		class="absolute inset-0 h-full w-full object-cover"
	/>
	<div
		class="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/45 to-transparent"
	></div>

	<div class="relative z-10 flex min-h-[88vh] flex-col">
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
				>Cart · 4</button
			>
		</header>

		<!-- Content -->
		<div
			class="mx-auto grid w-full max-w-6xl flex-1 items-end gap-10 px-6 pb-16 lg:grid-cols-2 lg:gap-12"
		>
			<!-- Copy -->
			<div class="max-w-xl pb-2">
				<div
					class="mb-5 flex items-center gap-3 font-mono text-xs uppercase tracking-wide text-background/70"
				>
					<span class="h-px w-8 bg-background/50"></span> The slow-living shop
				</div>
				<h1
					class="max-w-xl font-display text-5xl font-extrabold leading-[0.98] tracking-tight sm:text-6xl"
				>
					Make the room you <span class="text-primary">never</span> want to leave.
				</h1>
				<p class="mt-5 max-w-md text-lg text-background/80">
					Considered, long-lasting pieces for every corner of the home — natural materials, honest
					prices, and styling help if you want it.
				</p>
				<div class="mt-7 flex flex-wrap gap-3.5">
					<button
						type="button"
						class="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition hover:brightness-110"
					>
						Shop the room <ArrowRight size={19} />
					</button>
					<button
						type="button"
						class="rounded-lg border border-background/30 px-6 py-3 text-base font-semibold text-background hover:bg-background/10"
					>
						Book a stylist
					</button>
				</div>
			</div>

			<!-- Featured product card -->
			<div class="w-full max-w-xs justify-self-end">
				<div class="overflow-hidden rounded-xl bg-card text-card-foreground shadow-xl">
					<div class="relative aspect-[4/3] bg-muted">
						<img
							src="https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=700&q=80"
							alt="Lounge chair"
							loading="lazy"
							class="h-full w-full object-cover"
						/>
						<span
							class="absolute left-3 top-3 inline-flex items-center rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground"
							>In this room</span
						>
					</div>
					<div class="p-4">
						<div class="flex items-baseline justify-between gap-2.5">
							<div class="font-display text-lg font-bold">Linden lounge chair</div>
							<div class="font-display text-lg font-extrabold text-primary">$520</div>
						</div>
						<div class="mt-1.5 text-sm text-muted-foreground">Solid oak frame · wool bouclé</div>
						<button
							type="button"
							class="mt-3.5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
						>
							<ShoppingBag size={18} /> Add to cart
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
