<script lang="ts">
	import Navbar from "$lib/blocks/navbars/classic/block.svelte";
	import Hero from "$lib/blocks/heros/app/block.svelte";
	import Logos from "$lib/blocks/logos/row/block.svelte";
	import Features from "$lib/blocks/features/grid/block.svelte";
	import Stats from "$lib/blocks/stats/band/block.svelte";
	import Pricing from "$lib/blocks/pricing/columns/block.svelte";
	import Testimonials from "$lib/blocks/testimonials/grid/block.svelte";
	import Faq from "$lib/blocks/faq/accordion/block.svelte";
	import Cta from "$lib/blocks/cta/banner/block.svelte";
	import Footer from "$lib/blocks/footers/columns/block.svelte";
</script>

<div class="flex min-h-screen flex-col bg-background">
	<Navbar />
	<main class="flex-1">
		<Hero />
		<Logos />
		<Features />
		<Stats />
		<Pricing />
		<Testimonials />
		<Faq />
		<Cta />
	</main>
	<Footer />
</div>
