<script lang="ts">
	import Dark from "$blocks/navbars/dark/block.svelte";
	import Glass from "$blocks/navbars/glass/block.svelte";
	import Brutalist from "$blocks/navbars/brutalist/block.svelte";
	import Pill from "$blocks/navbars/pill/block.svelte";
	import Gradient from "$blocks/navbars/gradient/block.svelte";
	import Lime from "$blocks/navbars/lime/block.svelte";
	import Overlay from "$blocks/navbars/overlay/block.svelte";
</script>

<div class="max-h-[80vh] space-y-6 overflow-y-auto rounded-lg border border-border bg-muted/30 p-6">
	<Dark />
	<Glass />
	<Brutalist />
	<Pill />
	<Gradient />
	<Lime />
	<!-- overlay floats over a hero image — show it on a dark photo backdrop -->
	<div class="relative h-40 overflow-hidden rounded-lg">
		<img
			src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=80"
			alt=""
			loading="lazy"
			class="absolute inset-0 h-full w-full object-cover"
		/>
		<div class="absolute inset-0 bg-foreground/50"></div>
		<Overlay />
	</div>
</div>
