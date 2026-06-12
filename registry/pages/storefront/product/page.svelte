<script lang="ts">
	import { ChevronRight } from "@lucide/svelte";
	import Header from "$lib/blocks/storefront/header/block.svelte";
	import ProductGallery from "$lib/blocks/storefront/product-gallery/block.svelte";
	import ProductOptions from "$lib/blocks/storefront/product-options/block.svelte";
	import TrustRow from "$lib/blocks/storefront/trust-row/block.svelte";
	import PdpAccordions from "$lib/blocks/storefront/pdp-accordions/block.svelte";
	import FeaturedCollection from "$lib/blocks/storefront/featured-collection/block.svelte";
	import Footer from "$lib/blocks/storefront/footer/block.svelte";
	import CartDrawer from "$lib/blocks/storefront/cart-drawer/block.svelte";
	import { createCart } from "$lib/blocks/storefront/store/store.svelte.ts";
	import { purposes } from "$lib/blocks/storefront/store/purposes.ts";

	const purpose = purposes.clay;
	const cart = createCart();

	const product = purpose.products[0];
	const related = purpose.products.slice(1, 5);
</script>

<div class="min-h-screen bg-background font-body text-foreground">
	<Header nav={purpose.nav} {cart} />

	<main class="mx-auto w-full max-w-6xl px-6 py-8 sm:py-10">
		<nav
			class="mb-6 flex items-center gap-2 text-[13px] text-muted-foreground/70"
			aria-label="Breadcrumb"
		>
			<a href="##" class="transition-colors hover:text-foreground">Home</a>
			<ChevronRight size={13} />
			<a href="##" class="transition-colors hover:text-foreground">{product.category}</a>
			<ChevronRight size={13} />
			<span class="text-foreground">{product.name}</span>
		</nav>

		<div class="grid items-start gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
			<ProductGallery alt={product.name} />
			<div class="flex flex-col gap-6">
				<ProductOptions {product} {cart} />
				<TrustRow />
				<PdpAccordions />
			</div>
		</div>
	</main>

	<FeaturedCollection
		eyebrow="You might also like"
		title="Complete the look"
		sub=""
		products={related}
		{cart}
	/>

	<Footer />

	<CartDrawer {cart} />
</div>
