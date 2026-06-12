<script lang="ts">
	import CategoryTiles from "$blocks/storefront/category-tiles/block.svelte";
	import ValueRow from "$blocks/storefront/value-row/block.svelte";
	import PromoBanner from "$blocks/storefront/promo-banner/block.svelte";
	import PromoStrip from "$blocks/storefront/promo-strip/block.svelte";
	import Editorial from "$blocks/storefront/editorial/block.svelte";
	import Testimonials from "$blocks/storefront/testimonials/block.svelte";
	import Newsletter from "$blocks/storefront/newsletter/block.svelte";
</script>

<div class="max-h-[80vh] overflow-y-auto rounded-lg border border-border bg-background">
	<CategoryTiles />
	<ValueRow />
	<PromoBanner />
	<PromoStrip />
	<Editorial />
	<Testimonials />
	<Newsletter />
</div>
