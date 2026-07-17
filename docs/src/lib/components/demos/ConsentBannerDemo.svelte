<script lang="ts">
	import Banner from "$blocks/consent/banner/block.svelte";

	let generation = $state(0);

	function reset() {
		localStorage.removeItem("consent-demo");
		generation += 1;
	}
</script>

<!-- the transform makes the block's `fixed` position relative to this box instead of the viewport -->
<div
	class="relative min-h-64 overflow-hidden rounded-lg border border-border bg-muted/30 p-6 [transform:translateZ(0)]"
>
	<p class="text-sm text-muted-foreground">
		Page content sits here — the banner overlays the bottom edge until a choice is made.
	</p>
	<button
		type="button"
		onclick={reset}
		class="mt-4 rounded-lg border border-border px-4 py-2 text-sm font-semibold transition hover:bg-muted"
	>
		Show banner again
	</button>
	{#key generation}
		<Banner storageKey="consent-demo" />
	{/key}
</div>
