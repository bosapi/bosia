<script lang="ts">
	import Navbar from "$lib/blocks/navbars/minimal/block.svelte";
	import Contact from "$lib/blocks/contact/split/block.svelte";
	import Footer from "$lib/blocks/footers/minimal/block.svelte";
</script>

<div class="flex min-h-screen flex-col bg-background">
	<Navbar />
	<main class="flex-1">
		<Contact />
	</main>
	<Footer />
</div>
