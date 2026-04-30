<script lang="ts">
	import { LineChart, BarChart } from "$registry/chart";

	const lineData = [
		{ date: "2024-01-01", value: 120 },
		{ date: "2024-01-02", value: 280 },
		{ date: "2024-01-03", value: 210 },
		{ date: "2024-01-04", value: 450 },
		{ date: "2024-01-05", value: 390 },
		{ date: "2024-01-06", value: 520 },
		{ date: "2024-01-07", value: 480 },
	];

	const barData = [
		{ date: "2024-01", value: 1200 },
		{ date: "2024-02", value: 1800 },
		{ date: "2024-03", value: 1500 },
		{ date: "2024-04", value: 2200 },
		{ date: "2024-05", value: 1900 },
		{ date: "2024-06", value: 2600 },
	];

	let chartType = $state<"line" | "area" | "bar">("line");
</script>

<div class="flex flex-col gap-4 w-full">
	<div class="flex flex-wrap items-center gap-2">
		<button
			class="px-3 py-1 text-xs rounded-md border transition-colors"
			class:bg-primary={chartType === "line"}
			class:text-primary-foreground={chartType === "line"}
			onclick={() => (chartType = "line")}
		>
			Line
		</button>
		<button
			class="px-3 py-1 text-xs rounded-md border transition-colors"
			class:bg-primary={chartType === "area"}
			class:text-primary-foreground={chartType === "area"}
			onclick={() => (chartType = "area")}
		>
			Area
		</button>
		<button
			class="px-3 py-1 text-xs rounded-md border transition-colors"
			class:bg-primary={chartType === "bar"}
			class:text-primary-foreground={chartType === "bar"}
			onclick={() => (chartType = "bar")}
		>
			Bar
		</button>
	</div>

	{#if chartType === "line"}
		<LineChart data={lineData} height={240} />
	{:else if chartType === "area"}
		<LineChart data={lineData} height={240} showArea showDots={false} />
	{:else}
		<BarChart data={barData} height={240} granularity="month" />
	{/if}
</div>
