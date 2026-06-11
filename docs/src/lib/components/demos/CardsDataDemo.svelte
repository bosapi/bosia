<script lang="ts">
	import Stat from "$blocks/cards/stat/block.svelte";
	import Progress from "$blocks/cards/progress/block.svelte";
	import Chart from "$blocks/cards/chart/block.svelte";
	import Balance from "$blocks/cards/balance/block.svelte";
</script>

<div class="flex flex-wrap items-start justify-center gap-5 p-6">
	<Stat />
	<Progress />
	<Chart />
	<Balance />
</div>
