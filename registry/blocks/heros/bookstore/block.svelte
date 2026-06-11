<script lang="ts">
	import { Search, ShoppingBag, ArrowRight, Star, Truck } from "@lucide/svelte";

	const links = ["Fiction", "Non-fiction", "Kids", "Staff picks"];
	const covers = [
		"https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&q=80",
		"https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80",
		"https://images.unsplash.com/photo-1589998059171-988d887df646?w=600&q=80",
	];
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
				<Search size={18} /> Search titles
			</button>
			<button
				type="button"
				class="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground"
			>
				<ShoppingBag size={18} /> Bag · 3
			</button>
		</div>
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
				<span class="h-px w-8 bg-primary/60"></span> This week’s shelf · New &amp; noted
			</div>
			<h1 class="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
				Stories worth <span class="text-primary">staying up</span> for.
			</h1>
			<p class="mt-4 max-w-md text-lg text-muted-foreground">
				Hand-picked fiction, fresh non-fiction and the indie titles you won’t find on the front
				table. Curated by booksellers who actually read them.
			</p>
			<div class="mt-6 flex flex-wrap gap-3">
				<button
					type="button"
					class="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition hover:brightness-110"
				>
					Browse the shelf <ArrowRight size={19} />
				</button>
				<button
					type="button"
					class="inline-flex items-center rounded-lg border border-input px-6 py-3 text-base font-semibold transition hover:bg-muted"
				>
					Read a sample
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
					<span class="text-sm text-muted-foreground">from 8,200 readers</span>
				</div>
				<div class="flex items-center gap-2.5 text-sm font-semibold text-muted-foreground">
					<span class="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
						<Truck size={18} />
					</span>
					Free shipping over $35
				</div>
			</div>
		</div>

		<!-- Fanned covers -->
		<div class="relative flex min-h-[420px] items-center justify-center">
			<div class="absolute h-72 w-72 rounded-full bg-primary/10 blur-2xl" aria-hidden="true"></div>
			<div
				class="absolute left-[8%] top-1/2 aspect-[2/3] w-44 -translate-y-1/2 -rotate-[9deg] overflow-hidden rounded-xl border border-card shadow-xl"
			>
				<img src={covers[0]} alt="" loading="lazy" class="h-full w-full object-cover" />
			</div>
			<div
				class="absolute right-[8%] top-1/2 aspect-[2/3] w-44 -translate-y-1/2 rotate-[9deg] overflow-hidden rounded-xl border border-card shadow-xl"
			>
				<img src={covers[2]} alt="" loading="lazy" class="h-full w-full object-cover" />
			</div>
			<div
				class="relative aspect-[2/3] w-48 overflow-hidden rounded-xl border border-card shadow-xl"
			>
				<img src={covers[1]} alt="" loading="lazy" class="h-full w-full object-cover" />
			</div>
			<!-- Staff-pick card -->
			<div
				class="absolute bottom-2 left-0 flex max-w-[15rem] items-center gap-3 rounded-xl bg-card px-4 py-3.5 text-card-foreground shadow-xl"
			>
				<img
					src="https://i.pravatar.cc/80?img=5"
					alt=""
					loading="lazy"
					class="h-10 w-10 flex-none rounded-full object-cover"
				/>
				<div>
					<span
						class="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary"
						>Staff pick</span
					>
					<div class="mt-1.5 text-xs leading-snug text-muted-foreground">
						“The best debut novel I’ve read all year.” — Jeki, fiction buyer
					</div>
				</div>
			</div>
			<div
				class="absolute right-0 top-2 rounded-full bg-foreground px-4 py-2 font-mono text-xs tracking-wide text-background shadow-md"
			>
				Signed first edition
			</div>
		</div>
	</div>
</section>
