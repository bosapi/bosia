<script lang="ts">
	import Header from "$lib/blocks/storefront/header/block.svelte";
	import AccountNav from "$lib/blocks/storefront/account-nav/block.svelte";
	import OrderList from "$lib/blocks/storefront/order-list/block.svelte";
	import OrderDetail from "$lib/blocks/storefront/order-detail/block.svelte";
	import AddressBook from "$lib/blocks/storefront/address-book/block.svelte";
	import AccountSettings from "$lib/blocks/storefront/account-settings/block.svelte";
	import Footer from "$lib/blocks/storefront/footer/block.svelte";
	import CartDrawer from "$lib/blocks/storefront/cart-drawer/block.svelte";
	import { createCart } from "$lib/blocks/storefront/store/store.svelte.ts";
	import { purposes } from "$lib/blocks/storefront/store/purposes.ts";
	import type { Order } from "$lib/blocks/storefront/store/orders.ts";

	const purpose = purposes.clay;
	const cart = createCart();

	let active = $state("orders");
	let selected = $state<Order | null>(null);

	const titles: Record<string, string> = {
		orders: "Orders",
		addresses: "Addresses",
		settings: "Settings",
	};
</script>

<div class="min-h-screen bg-background font-body text-foreground">
	<Header nav={purpose.nav} {cart} />

	<main class="mx-auto w-full max-w-6xl px-6 py-8 sm:py-10">
		<h1 class="mb-8 font-display text-3xl tracking-tight sm:text-4xl">My account</h1>

		<div class="grid items-start gap-8 lg:grid-cols-[240px_1fr] lg:gap-14">
			<div class="lg:sticky lg:top-24">
				<AccountNav bind:active onSignOut={() => (active = "orders")} />
			</div>

			<section aria-label={titles[active] ?? "Account"}>
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
			</section>
		</div>
	</main>

	<Footer />

	<CartDrawer {cart} />
</div>
