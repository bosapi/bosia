<script lang="ts">
	import Columns from "$blocks/pricing/columns/block.svelte";
	import Comparison from "$blocks/pricing/comparison/block.svelte";
	import Simple from "$blocks/pricing/simple/block.svelte";
</script>

<div class="max-h-[80vh] space-y-6 overflow-y-auto rounded-lg border border-border bg-muted/30 p-6">
	<Columns />
	<Comparison />
	<Simple />
</div>
