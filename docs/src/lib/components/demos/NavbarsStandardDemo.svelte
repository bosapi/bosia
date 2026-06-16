<script lang="ts">
	import Classic from "$blocks/navbars/classic/block.svelte";
	import Split from "$blocks/navbars/split/block.svelte";
	import Centered from "$blocks/navbars/centered/block.svelte";
	import Search from "$blocks/navbars/search/block.svelte";
	import Minimal from "$blocks/navbars/minimal/block.svelte";
	import TwoTier from "$blocks/navbars/two-tier/block.svelte";
</script>

<div class="max-h-[80vh] space-y-6 overflow-y-auto rounded-lg border border-border bg-muted/30 p-6">
	<Classic />
	<Split />
	<Centered />
	<Search />
	<Minimal />
	<TwoTier />
</div>
