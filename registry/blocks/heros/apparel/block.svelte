<script lang="ts">
	import { ShoppingBag, Check } from "@lucide/svelte";

	const colors = ["#14130F", "#C9B89A", "#5B6B57", "#A23B2C"];
	const sizes = ["XS", "S", "M", "L", "XL"];

	let activeColor = $state(0);
	let activeSize = $state(2);
</script>

<section class="relative w-full overflow-hidden bg-background text-foreground">
	<!-- Content -->
	<div
		class="mx-auto grid w-full max-w-6xl items-center gap-10 px-6 py-16 lg:grid-cols-2 lg:gap-12"
	>
		<!-- Copy + selectors -->
		<div class="max-w-xl">
			<div class="mb-5 flex flex-wrap gap-2.5">
				<span
					class="inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"
					>New arrivals</span
				>
				<span
					class="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground"
				>
					<span class="h-1.5 w-1.5 rounded-full bg-current"></span> Organic cotton
				</span>
			</div>
			<h1 class="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
				The everyday tee, <span class="text-primary">finally</span> done right.
			</h1>
			<p class="mt-4 max-w-md text-lg text-muted-foreground">
				Heavyweight 240gsm jersey, pre-shrunk and built to keep its shape after wash one hundred.
				Cut for a clean, boxy fit.
			</p>

			<div class="mt-6 flex flex-col gap-4">
				<div class="flex items-center gap-4">
					<span class="w-14 font-mono text-xs uppercase tracking-wide text-muted-foreground/70"
						>Color</span
					>
					<div class="flex gap-3">
						{#each colors as color, i (color)}
							<button
								type="button"
								onclick={() => (activeColor = i)}
								aria-label="Select color {i + 1}"
								class="h-7 w-7 rounded-full ring-offset-2 ring-offset-background transition {activeColor ===
								i
									? 'ring-2 ring-foreground'
									: 'ring-1 ring-border'}"
								style="background:{color}"
							></button>
						{/each}
					</div>
				</div>
				<div class="flex items-center gap-4">
					<span class="w-14 font-mono text-xs uppercase tracking-wide text-muted-foreground/70"
						>Size</span
					>
					<div class="flex gap-2">
						{#each sizes as size, i (size)}
							<button
								type="button"
								onclick={() => (activeSize = i)}
								class="grid h-10 min-w-10 place-items-center rounded-md px-2 text-sm font-semibold transition {activeSize ===
								i
									? 'bg-foreground text-background'
									: 'border border-border hover:bg-muted'}"
							>
								{size}
							</button>
						{/each}
					</div>
				</div>
			</div>

			<div class="mt-7 flex flex-wrap items-center gap-4">
				<button
					type="button"
					class="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition hover:brightness-110"
				>
					<ShoppingBag size={19} /> Add to cart · $42
				</button>
				<span class="text-sm font-semibold text-muted-foreground">Free returns within 30 days</span>
			</div>
		</div>

		<!-- Model -->
		<div class="relative flex items-center justify-center">
			<div
				class="relative aspect-[4/5] w-full max-w-md overflow-hidden rounded-2xl bg-muted shadow-lg"
			>
				<img
					src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&q=80"
					alt="Model wearing tee"
					loading="lazy"
					class="h-full w-full object-cover"
				/>
			</div>
			<div
				class="absolute -right-1 bottom-11 flex items-center gap-3 rounded-xl bg-card px-4 py-3 text-card-foreground shadow-lg"
			>
				<div class="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
					<Check size={20} />
				</div>
				<div>
					<div class="text-sm font-bold">In stock · ships today</div>
					<div class="text-xs text-muted-foreground">Order before 4pm</div>
				</div>
			</div>
			<div
				class="absolute left-2.5 top-7 rounded-full bg-card px-4 py-2 font-mono text-xs tracking-wide text-card-foreground shadow-md"
			>
				240gsm · pre-shrunk
			</div>
		</div>
	</div>
</section>
