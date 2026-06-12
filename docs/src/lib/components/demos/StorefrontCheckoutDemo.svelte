<script lang="ts">
	import CheckoutForm from "$blocks/storefront/checkout-form/block.svelte";
	import OrderSummary from "$blocks/storefront/order-summary/block.svelte";
</script>

<div class="max-h-[80vh] overflow-y-auto rounded-lg border border-border bg-background p-6">
	<div class="grid items-start gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-12">
		<CheckoutForm />
		<OrderSummary />
	</div>
</div>
