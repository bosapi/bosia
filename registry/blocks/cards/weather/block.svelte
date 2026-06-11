<script lang="ts">
	import { Sun, CloudSun, CloudRain, Cloud } from "@lucide/svelte";

	const days = [
		{ d: "Mon", icon: Sun, t: 24 },
		{ d: "Tue", icon: CloudSun, t: 21 },
		{ d: "Wed", icon: CloudRain, t: 18 },
		{ d: "Thu", icon: Cloud, t: 19 },
	];
</script>

<div
	class="flex w-full max-w-[260px] flex-col rounded-xl bg-gradient-to-br from-primary to-primary/70 p-5 text-white shadow-md transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lg"
>
	<div class="flex items-start justify-between">
		<div>
			<div class="text-sm font-semibold opacity-90">Lisbon</div>
			<div class="text-xs opacity-70">Mostly sunny</div>
		</div>
		<CloudSun size={36} />
	</div>
	<div class="mb-4 mt-2.5 font-display text-[56px] font-extrabold leading-none tracking-tight">
		24°
	</div>
	<div class="flex justify-between border-t border-white/20 pt-3.5">
		{#each days as day (day.d)}
			<div class="flex flex-col items-center gap-1.5">
				<span class="text-[11px] opacity-80">{day.d}</span>
				<day.icon size={18} />
				<span class="text-[13px] font-semibold">{day.t}°</span>
			</div>
		{/each}
	</div>
</div>
