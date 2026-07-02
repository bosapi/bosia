<script lang="ts">
	import {
		money,
		sampleProducts,
		type Product,
	} from "$lib/blocks/storefront/store/store.svelte.ts";

	interface Section {
		title: string;
		links: string[];
	}

	interface Props {
		sections?: Section[];
		/** Product spotlighted in the last column. */
		featured?: Product;
		/** Parent-controlled visibility; defaults open so the block renders standalone. */
		open?: boolean;
	}

	let {
		sections = [
			{ title: "Shop", links: ["New arrivals", "Best sellers", "Back in stock", "Last chance"] },
			{
				title: "Collections",
				links: ["The essentials", "Seasonal edit", "Gifting", "Limited runs"],
			},
			{ title: "Featured", links: ["Editor's picks", "Under $50", "Bundles & sets", "Clearance"] },
			{ title: "Learn", links: ["Our makers", "Care guides", "Sustainability", "Journal"] },
		],
		featured = sampleProducts[0],
		open = true,
	}: Props = $props();
</script>

<div
	class="w-full border-b border-border bg-card text-card-foreground shadow-lg transition-all duration-200 {open
		? 'visible translate-y-0 opacity-100'
		: 'invisible -translate-y-2 opacity-0'}"
>
	<div
		class="mx-auto grid w-full max-w-6xl grid-cols-2 gap-8 px-6 py-9 md:grid-cols-[repeat(4,1fr)_1.3fr]"
	>
		{#each sections as section (section.title)}
			<div>
				<h5 class="mb-3.5 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground/70">
					{section.title}
				</h5>
				{#each section.links as link (link)}
					<a
						href="##"
						class="block py-1.5 text-[15px] text-muted-foreground transition-colors hover:text-primary"
						>{link}</a
					>
				{/each}
			</div>
		{/each}

		<a href="##" class="group hidden overflow-hidden rounded-xl bg-muted md:block">
			<div class="relative aspect-[4/3] overflow-hidden">
				{#if featured.image}
					<img
						src={featured.image}
						alt={featured.name}
						class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
					/>
				{/if}
			</div>
			<div class="p-4">
				<span class="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Featured</span>
				<div class="mt-1 text-[15px] font-medium text-foreground">{featured.name}</div>
				<div class="text-sm text-muted-foreground tabular-nums">{money(featured.price)}</div>
			</div>
		</a>
	</div>
</div>
