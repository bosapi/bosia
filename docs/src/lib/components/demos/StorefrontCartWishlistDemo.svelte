<script lang="ts">
	import CartLines from "$blocks/storefront/cart-lines/block.svelte";
	import WishlistGrid from "$blocks/storefront/wishlist-grid/block.svelte";
	import EmptyState from "$blocks/storefront/empty-state/block.svelte";
</script>

<div
	class="max-h-[80vh] space-y-10 overflow-y-auto rounded-lg border border-border bg-background p-6"
>
	<section>
		<h3 class="mb-4 font-display text-lg">Cart lines</h3>
		<CartLines />
	</section>
	<section>
		<h3 class="mb-4 font-display text-lg">Wishlist grid</h3>
		<WishlistGrid />
	</section>
	<section>
		<h3 class="mb-4 font-display text-lg">Empty state</h3>
		<EmptyState />
	</section>
</div>
