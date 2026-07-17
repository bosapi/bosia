<script lang="ts">
	import { Dialog, DialogContent } from "$lib/components/ui/dialog";

	type Image = {
		src: string;
		alt: string;
		caption?: string;
	};

	let {
		heading = "Gallery",
		intro = "A look at the work, the space and the people behind it.",
		images = [
			{ src: "https://picsum.photos/id/1015/1200/900", alt: "River winding through a valley" },
			{ src: "https://picsum.photos/id/1018/1200/900", alt: "Mountain ridge at dawn" },
			{ src: "https://picsum.photos/id/1025/1200/900", alt: "Dog looking at the camera" },
			{ src: "https://picsum.photos/id/1040/1200/900", alt: "Castle on a hilltop" },
			{ src: "https://picsum.photos/id/1043/1200/900", alt: "Lantern-lit street at night" },
			{ src: "https://picsum.photos/id/1056/1200/900", alt: "Fog rolling over a forest" },
			{ src: "https://picsum.photos/id/106/1200/900", alt: "Pink blossoms against the sky" },
			{ src: "https://picsum.photos/id/110/1200/900", alt: "Winter road between trees" },
		] as Image[],
	}: {
		heading?: string;
		intro?: string;
		images?: Image[];
	} = $props();

	let open = $state(false);
	let active = $state<Image | null>(null);

	function show(image: Image) {
		active = image;
		open = true;
	}
</script>

<section class="w-full bg-background">
	<div class="mx-auto w-full max-w-6xl px-6 py-16 sm:py-24">
		<h2 class="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{heading}</h2>
		<p class="mt-4 max-w-xl text-muted-foreground">{intro}</p>

		<div class="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
			{#each images as image (image.src)}
				<button
					type="button"
					class="group aspect-square overflow-hidden rounded-xl border border-border bg-muted focus-visible:outline-2 focus-visible:outline-primary"
					onclick={() => show(image)}
				>
					<img
						src={image.src}
						alt={image.alt}
						loading="lazy"
						class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
					/>
				</button>
			{/each}
		</div>
	</div>
</section>

<Dialog bind:open>
	<DialogContent class="max-w-4xl overflow-hidden p-0">
		{#if active}
			<img src={active.src} alt={active.alt} class="max-h-[80vh] w-full object-contain" />
			{#if active.caption}
				<p class="px-6 pb-4 text-center text-sm text-muted-foreground">{active.caption}</p>
			{/if}
		{/if}
	</DialogContent>
</Dialog>
