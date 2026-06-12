<script lang="ts">
	interface Props {
		images?: string[];
		alt?: string;
	}

	let {
		images = [
			"https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=900&q=80",
			"https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=300&q=80",
			"https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=300&q=80",
			"https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=300&q=80",
		],
		alt = "Product image",
	}: Props = $props();

	let active = $state(0);
</script>

<div class="grid grid-cols-[72px_1fr] gap-4 lg:sticky lg:top-24">
	<div class="flex flex-col gap-2.5">
		{#each images as image, i (image)}
			<button
				type="button"
				onclick={() => (active = i)}
				aria-label="View image {i + 1}"
				class="aspect-square overflow-hidden rounded-lg border-[1.5px] transition {active === i
					? 'border-foreground'
					: 'border-transparent hover:border-border'}"
			>
				<img src={image} alt="" loading="lazy" class="h-full w-full object-cover" />
			</button>
		{/each}
	</div>
	<div class="relative aspect-[4/5] overflow-hidden rounded-xl bg-muted">
		<img src={images[active]} {alt} class="absolute inset-0 h-full w-full object-cover" />
	</div>
</div>
