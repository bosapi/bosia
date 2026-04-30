<script lang="ts">
	import { Slider } from "$registry/slider";

	let singleValue = $state(50);
	let rangeValue = $state<[number, number]>([25, 75]);
</script>

<div class="flex w-full max-w-md flex-col gap-8">
	<!-- Basic slider -->
	<div class="space-y-2">
		<Slider bind:value={singleValue} />
		<p class="text-sm text-muted-foreground">Value: {singleValue}</p>
	</div>

	<!-- Range slider -->
	<div class="space-y-2">
		<Slider type="range" bind:value={rangeValue} />
		<p class="text-sm text-muted-foreground">Range: {rangeValue[0]} – {rangeValue[1]}</p>
	</div>

	<!-- Custom step -->
	<div class="space-y-2">
		<Slider value={25} step={25} />
		<p class="text-sm text-muted-foreground">Step: 25</p>
	</div>

	<!-- Disabled -->
	<div class="space-y-2">
		<Slider value={60} disabled />
		<p class="text-sm text-muted-foreground">Disabled</p>
	</div>

	<!-- Vertical -->
	<div class="space-y-2">
		<p class="text-sm text-muted-foreground">Vertical</p>
		<div class="h-40">
			<Slider value={40} orientation="vertical" />
		</div>
	</div>
</div>
