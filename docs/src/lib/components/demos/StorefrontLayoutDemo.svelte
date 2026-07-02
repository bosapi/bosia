<script lang="ts">
	import Header from "$blocks/storefront/header/block.svelte";
	import Footer from "$blocks/storefront/footer/block.svelte";
	import SearchOverlay from "$blocks/storefront/search-overlay/block.svelte";

	let searchOpen = $state(false);
</script>

<div class="max-h-[80vh] overflow-y-auto rounded-lg border border-border">
	<Header onSearch={() => (searchOpen = true)} />
	<div class="bg-background px-6 py-16 text-center text-sm text-muted-foreground">
		Page content sits between the header and footer. Try the search icon in the header.
	</div>
	<Footer />
</div>

<SearchOverlay bind:open={searchOpen} />
