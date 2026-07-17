<script lang="ts">
	type Image = {
		src: string;
		alt: string;
	};

	let {
		heading = "In pictures",
		intro = "Moments from the studio, the road and everything in between.",
		images = [
			{ src: "https://picsum.photos/id/1015/800/1100", alt: "River winding through a valley" },
			{ src: "https://picsum.photos/id/1018/800/600", alt: "Mountain ridge at dawn" },
			{ src: "https://picsum.photos/id/1025/800/900", alt: "Dog looking at the camera" },
			{ src: "https://picsum.photos/id/1040/800/650", alt: "Castle on a hilltop" },
			{ src: "https://picsum.photos/id/1043/800/1000", alt: "Lantern-lit street at night" },
			{ src: "https://picsum.photos/id/1056/800/700", alt: "Fog rolling over a forest" },
			{ src: "https://picsum.photos/id/106/800/1050", alt: "Pink blossoms against the sky" },
			{ src: "https://picsum.photos/id/110/800/620", alt: "Winter road between trees" },
			{ src: "https://picsum.photos/id/119/800/850", alt: "Laptop on a wooden desk" },
		] as Image[],
	}: {
		heading?: string;
		intro?: string;
		images?: Image[];
	} = $props();
</script>

<section class="w-full bg-background">
	<div class="mx-auto w-full max-w-6xl px-6 py-16 sm:py-24">
		<h2 class="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{heading}</h2>
		<p class="mt-4 max-w-xl text-muted-foreground">{intro}</p>

		<!-- CSS-columns masonry: items flow top-to-bottom per column, no JS or library -->
		<div class="mt-12 columns-2 gap-3 sm:columns-3 lg:gap-4 [&>*]:mb-3 lg:[&>*]:mb-4">
			{#each images as image (image.src)}
				<figure class="break-inside-avoid overflow-hidden rounded-xl border border-border bg-muted">
					<img src={image.src} alt={image.alt} loading="lazy" class="w-full object-cover" />
				</figure>
			{/each}
		</div>
	</div>
</section>
