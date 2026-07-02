<script lang="ts">
	import AccountNav from "$blocks/storefront/account-nav/block.svelte";
	import OrderList from "$blocks/storefront/order-list/block.svelte";
	import OrderDetail from "$blocks/storefront/order-detail/block.svelte";
	import AddressBook from "$blocks/storefront/address-book/block.svelte";
	import AccountSettings from "$blocks/storefront/account-settings/block.svelte";
	import type { Order } from "$blocks/storefront/store/orders.ts";

	let active = $state("orders");
	let selected = $state<Order | null>(null);
</script>

<div class="max-h-[80vh] overflow-y-auto rounded-lg border border-border bg-background p-6">
	<div class="grid items-start gap-8 lg:grid-cols-[240px_1fr] lg:gap-12">
		<AccountNav bind:active />
		{#if active === "orders"}
			{#if selected}
				<OrderDetail order={selected} onBack={() => (selected = null)} />
			{:else}
				<OrderList onView={(order) => (selected = order)} />
			{/if}
		{:else if active === "addresses"}
			<AddressBook />
		{:else if active === "settings"}
			<AccountSettings />
		{/if}
	</div>
</div>
