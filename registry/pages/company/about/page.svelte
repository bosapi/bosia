<script lang="ts">
	import Navbar from "$lib/blocks/navbars/minimal/block.svelte";
	import Hero from "$lib/blocks/heros/consulting/block.svelte";
	import Stats from "$lib/blocks/stats/band/block.svelte";
	import Team from "$lib/blocks/team/grid/block.svelte";
	import Cta from "$lib/blocks/cta/panel/block.svelte";
	import Footer from "$lib/blocks/footers/minimal/block.svelte";
</script>

<div class="flex min-h-screen flex-col bg-background">
	<Navbar />
	<main class="flex-1">
		<Hero />
		<Stats />
		<Team />
		<Cta />
	</main>
	<Footer />
</div>
