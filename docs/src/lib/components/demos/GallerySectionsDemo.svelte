<script lang="ts">
	import Grid from "$blocks/gallery/grid/block.svelte";
	import Masonry from "$blocks/gallery/masonry/block.svelte";
</script>

<div class="max-h-[80vh] space-y-6 overflow-y-auto rounded-lg border border-border bg-muted/30 p-6">
	<Grid />
	<Masonry />
</div>
