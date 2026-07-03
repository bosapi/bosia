<script lang="ts">
	import Minimal from "$blocks/footers/minimal/block.svelte";
	import Columns from "$blocks/footers/columns/block.svelte";
	import Newsletter from "$blocks/footers/newsletter/block.svelte";
	import Centered from "$blocks/footers/centered/block.svelte";
	import Mega from "$blocks/footers/mega/block.svelte";
	import SplitBrand from "$blocks/footers/split-brand/block.svelte";
</script>

<div class="max-h-[80vh] space-y-6 overflow-y-auto rounded-lg border border-border bg-muted/30 p-6">
	<Minimal />
	<Columns />
	<Newsletter />
	<Centered />
	<Mega />
	<SplitBrand />
</div>
