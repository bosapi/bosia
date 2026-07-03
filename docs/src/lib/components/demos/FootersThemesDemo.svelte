<script lang="ts">
	import Dark from "$blocks/footers/dark/block.svelte";
	import Glass from "$blocks/footers/glass/block.svelte";
	import Gradient from "$blocks/footers/gradient/block.svelte";
	import Brutalist from "$blocks/footers/brutalist/block.svelte";
	import Editorial from "$blocks/footers/editorial/block.svelte";
	import Terminal from "$blocks/footers/terminal/block.svelte";
</script>

<div class="max-h-[80vh] space-y-6 overflow-y-auto rounded-lg border border-border bg-muted/30 p-6">
	<Dark />
	<Glass />
	<Gradient />
	<Brutalist />
	<Editorial />
	<Terminal />
</div>
