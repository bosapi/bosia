<script lang="ts">
	import Header from "$blocks/storefront/header/block.svelte";
	import Footer from "$blocks/storefront/footer/block.svelte";
</script>

<div class="max-h-[80vh] overflow-y-auto rounded-lg border border-border">
	<Header />
	<div class="bg-background px-6 py-16 text-center text-sm text-muted-foreground">
		Page content sits between the header and footer.
	</div>
	<Footer />
</div>
