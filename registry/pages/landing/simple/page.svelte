<script lang="ts">
	import Navbar from "$lib/blocks/navbars/minimal/block.svelte";
	import Hero from "$lib/blocks/heros/agency/block.svelte";
	import Features from "$lib/blocks/features/split/block.svelte";
	import Testimonial from "$lib/blocks/testimonials/spotlight/block.svelte";
	import Cta from "$lib/blocks/cta/panel/block.svelte";
	import Footer from "$lib/blocks/footers/minimal/block.svelte";
</script>

<div class="flex min-h-screen flex-col bg-background">
	<Navbar />
	<main class="flex-1">
		<Hero />
		<Features />
		<Testimonial />
		<Cta />
	</main>
	<Footer />
</div>
