<script lang="ts">
	interface Category {
		name: string;
		image: string;
	}
	interface Props {
		eyebrow?: string;
		title?: string;
		categories?: Category[];
	}

	let {
		eyebrow = "Shop by category",
		title = "Find your corner of the store",
		categories = [
			{
				name: "Home",
				image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600&q=80",
			},
			{
				name: "Kitchen",
				image: "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=600&q=80",
			},
			{
				name: "Pantry",
				image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80",
			},
			{
				name: "Living",
				image: "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=600&q=80",
			},
			{
				name: "Gifts",
				image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=600&q=80",
			},
		],
	}: Props = $props();
</script>

<section class="bg-background py-16 sm:py-20 lg:py-24">
	<div class="mx-auto w-full max-w-6xl px-6">
		{#if eyebrow || title}
			<div class="mb-8 sm:mb-10">
				{#if eyebrow}
					<span class="mb-3 block text-xs font-semibold uppercase tracking-[0.14em] text-primary"
						>{eyebrow}</span
					>
				{/if}
				{#if title}<h2 class="font-display text-3xl tracking-tight sm:text-4xl">{title}</h2>{/if}
			</div>
		{/if}

		<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
			{#each categories as cat (cat.name)}
				<a
					href="##"
					class="group relative flex aspect-[3/4] items-end overflow-hidden rounded-xl p-5 text-white no-underline transition-transform duration-200 hover:-translate-y-1"
				>
					<img
						src={cat.image}
						alt={cat.name}
						loading="lazy"
						class="absolute inset-0 z-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
					/>
					<span
						class="absolute inset-0 z-[1] bg-gradient-to-t from-black/60 via-transparent to-transparent"
					></span>
					<span class="relative z-[2] font-display text-[22px] tracking-tight">{cat.name}</span>
				</a>
			{/each}
		</div>
	</div>
</section>
