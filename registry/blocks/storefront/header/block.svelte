<script lang="ts">
	import { Search, User, Heart, ShoppingBag, ChevronDown } from "@lucide/svelte";
	import type { Cart } from "$lib/blocks/storefront/store/store.svelte.ts";

	interface Props {
		nav?: string[];
		announcements?: string[];
		/** Pass a shared cart to wire the bag/saved counts; omit to show static counts. */
		cart?: Cart;
		cartCount?: number;
		favCount?: number;
		onCart?: () => void;
		onSearch?: () => void;
	}

	let {
		nav = ["New In", "Shop", "Collections", "Sale"],
		announcements = [
			"Free carbon-neutral delivery over $50",
			"New season just landed",
			"30-day easy returns",
		],
		cart,
		cartCount,
		favCount,
		onCart,
		onSearch,
	}: Props = $props();

	const bag = $derived(cart ? cart.count : (cartCount ?? 0));
	const saved = $derived(cart ? cart.favCount : (favCount ?? 0));

	let mega = $state(false);

	const megaCols: Record<string, string[]> = {
		Shop: ["New arrivals", "Best sellers", "Back in stock", "Last chance"],
		Collections: ["The essentials", "Seasonal edit", "Gifting", "Limited runs"],
		Featured: ["Editor's picks", "Under $50", "Bundles & sets", "Clearance"],
		Learn: ["Our makers", "Care guides", "Sustainability", "Journal"],
	};

	function handleCart() {
		if (onCart) onCart();
		else if (cart) cart.open = true;
	}
</script>

<!-- Announcement bar -->
<div
	class="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 bg-foreground px-4 py-2.5 text-center text-[13px] text-background"
>
	{#each announcements as item, i (item)}
		{#if i > 0}
			<span class="h-1 w-1 rounded-full bg-primary"></span>
		{/if}
		<span>{item}</span>
	{/each}
</div>

<!-- Sticky header -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<header
	class="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md backdrop-saturate-150"
	onmouseleave={() => (mega = false)}
>
	<div class="mx-auto w-full max-w-6xl px-6">
		<div class="grid h-[76px] grid-cols-[1fr_auto_1fr] items-center gap-4">
			<!-- Nav -->
			<nav class="hidden items-center gap-1.5 justify-self-center md:flex" aria-label="Primary">
				{#each nav as link, i (link)}
					<button
						type="button"
						class="inline-flex items-center gap-1.5 rounded px-3.5 py-2 text-[15px] font-medium transition-colors hover:text-primary"
						onmouseenter={() => (mega = i === 1)}
					>
						{link}
						{#if i === 1}<ChevronDown size={15} class="opacity-60" />{/if}
					</button>
				{/each}
			</nav>

			<!-- Logo -->
			<a
				href="##"
				class="inline-flex items-center gap-2.5 justify-self-center text-foreground md:justify-self-center"
				aria-label="__BRAND__ home"
			>
				<span class="block h-8 w-8 text-primary">
					<svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
						<path d="M5 12 H35" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" />
						<path
							d="M6 12 V18.5 Q9.62 24.5 13.25 18.5 Q16.87 24.5 20.5 18.5 Q24.12 24.5 27.75 18.5 Q31.37 24.5 35 18.5 V12 Z"
							fill="currentColor"
						/>
						<path
							d="M9 30 V24 a3 3 0 0 1 6 0 V30"
							stroke="currentColor"
							stroke-width="2.4"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
						<path
							d="M22 30 V25 H31 V30"
							stroke="currentColor"
							stroke-width="2.4"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</span>
				<span class="font-display text-[25px] leading-none tracking-tight">__BRAND__</span>
			</a>

			<!-- Actions -->
			<div class="flex items-center gap-1 justify-self-end">
				<button
					type="button"
					class="inline-flex h-[42px] w-[42px] items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
					aria-label="Search"
					onclick={onSearch}
				>
					<Search size={20} />
				</button>
				<button
					type="button"
					class="hidden h-[42px] w-[42px] items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted sm:inline-flex"
					aria-label="Account"
				>
					<User size={20} />
				</button>
				<button
					type="button"
					class="relative inline-flex h-[42px] w-[42px] items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
					aria-label="Saved"
				>
					<Heart size={20} />
					{#if saved > 0}
						<span
							class="absolute right-1 top-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground"
							>{saved}</span
						>
					{/if}
				</button>
				<button
					type="button"
					class="relative inline-flex h-[42px] w-[42px] items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
					aria-label="Bag"
					onclick={handleCart}
				>
					<ShoppingBag size={20} />
					{#if bag > 0}
						<span
							class="absolute right-1 top-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground"
							>{bag}</span
						>
					{/if}
				</button>
			</div>
		</div>
	</div>

	<!-- Mega menu -->
	<div
		class="absolute inset-x-0 top-full border-b border-border bg-card shadow-lg transition-all duration-200 {mega
			? 'visible translate-y-0 opacity-100'
			: 'invisible -translate-y-2 opacity-0'}"
	>
		<div
			class="mx-auto grid w-full max-w-6xl grid-cols-2 gap-8 px-6 py-9 md:grid-cols-[repeat(4,1fr)_1.3fr]"
		>
			{#each Object.entries(megaCols) as [heading, links] (heading)}
				<div>
					<h5 class="mb-3.5 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground/70">
						{heading}
					</h5>
					{#each links as link (link)}
						<a
							href="##"
							class="block py-1.5 text-[15px] text-muted-foreground transition-colors hover:text-primary"
							>{link}</a
						>
					{/each}
				</div>
			{/each}
			<div class="hidden overflow-hidden rounded-xl bg-primary/10 md:block">
				<div class="grid h-full min-h-[180px] place-items-center text-primary">
					<span class="text-xs font-semibold uppercase tracking-[0.14em]">Featured</span>
				</div>
			</div>
		</div>
	</div>
</header>
