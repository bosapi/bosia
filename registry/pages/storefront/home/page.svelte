<script lang="ts">
	import { ArrowRight } from "@lucide/svelte";
	import Header from "$lib/blocks/storefront/header/block.svelte";
	import CategoryTiles from "$lib/blocks/storefront/category-tiles/block.svelte";
	import FeaturedCollection from "$lib/blocks/storefront/featured-collection/block.svelte";
	import ValueRow from "$lib/blocks/storefront/value-row/block.svelte";
	import PromoBanner from "$lib/blocks/storefront/promo-banner/block.svelte";
	import Editorial from "$lib/blocks/storefront/editorial/block.svelte";
	import Testimonials from "$lib/blocks/storefront/testimonials/block.svelte";
	import Newsletter from "$lib/blocks/storefront/newsletter/block.svelte";
	import Footer from "$lib/blocks/storefront/footer/block.svelte";
	import CartDrawer from "$lib/blocks/storefront/cart-drawer/block.svelte";
	import { createCart } from "$lib/blocks/storefront/store/store.svelte.ts";
	import { purposes } from "$lib/blocks/storefront/store/purposes.ts";

	// One storefront, many purposes — swap this key (and the matching theme) to
	// re-skin the whole page. See the bosia-storefront skill for the mapping.
	const purpose = purposes.clay;

	// A single cart wired through the header, product grids and the drawer.
	const cart = createCart();
</script>

<div class="min-h-screen bg-background font-body text-foreground">
	<Header nav={purpose.nav} {cart} />

	<!-- Hero -->
	<section class="bg-background">
		<div class="mx-auto grid w-full max-w-6xl items-stretch gap-0 px-0 lg:grid-cols-[1.05fr_1fr]">
			<div class="flex flex-col justify-center gap-5 px-6 py-12 lg:py-20 lg:pl-6 lg:pr-12">
				<span class="text-xs font-semibold uppercase tracking-[0.14em] text-primary"
					>{purpose.hero.eyebrow}</span
				>
				<h1 class="max-w-[14ch] font-display text-5xl leading-[0.98] tracking-tight sm:text-6xl">
					{purpose.hero.title}
				</h1>
				<p class="max-w-[44ch] text-lg text-muted-foreground">{purpose.hero.sub}</p>
				<div class="mt-1 flex flex-wrap gap-3">
					<button
						type="button"
						class="inline-flex items-center gap-2 rounded-lg bg-primary px-7 py-4 text-base font-semibold text-primary-foreground transition hover:brightness-110"
					>
						{purpose.hero.cta}
						<ArrowRight size={18} />
					</button>
					<button
						type="button"
						class="inline-flex items-center rounded-lg border border-input px-7 py-4 text-base font-semibold transition hover:bg-muted"
					>
						{purpose.hero.cta2}
					</button>
				</div>
			</div>
			<div class="relative min-h-[360px] bg-muted">
				<img
					src="https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1100&q=80"
					alt=""
					class="absolute inset-0 h-full w-full object-cover"
				/>
			</div>
		</div>
	</section>

	<CategoryTiles
		eyebrow="Shop by category"
		categories={purpose.categories.map((name, i) => ({
			name,
			image: [
				"https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600&q=80",
				"https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=600&q=80",
				"https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80",
				"https://images.unsplash.com/photo-1567016432779-094069958ea5?w=600&q=80",
				"https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=600&q=80",
			][i % 5],
		}))}
	/>

	<FeaturedCollection products={purpose.products} {cart} />

	<ValueRow />

	<PromoBanner />

	<Editorial />

	<Testimonials />

	<Newsletter />

	<Footer />

	<CartDrawer {cart} />
</div>
