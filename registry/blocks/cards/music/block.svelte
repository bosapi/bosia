<script lang="ts">
	import { Heart, SkipBack, SkipForward, Play, Pause } from "@lucide/svelte";

	let playing = $state(true);
</script>

<div
	class="flex w-full max-w-[290px] flex-col rounded-xl border border-border bg-card p-[18px] text-card-foreground shadow-md transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lg"
>
	<div class="flex items-center gap-3.5">
		<img
			src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=128&h=128&q=60&auto=format&fit=crop"
			alt="Album artwork"
			loading="lazy"
			class="h-16 w-16 flex-none rounded-lg object-cover shadow-md"
		/>
		<div class="min-w-0 flex-1">
			<div class="truncate font-display text-base font-bold">Paper Planes</div>
			<div class="text-[13px] text-muted-foreground">The Offcuts</div>
		</div>
		<Heart size={18} class="text-muted-foreground/70" />
	</div>

	<div class="mb-2.5 mt-4">
		<div class="relative h-[5px] rounded-full bg-muted">
			<div class="h-full w-[42%] rounded-full bg-primary"></div>
			<span
				class="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_0_3px_hsl(var(--card))]"
				style="left: 42%"
			></span>
		</div>
		<div class="mt-1.5 flex justify-between font-mono text-[11px] text-muted-foreground/70">
			<span>1:24</span><span>3:18</span>
		</div>
	</div>

	<div class="flex items-center justify-center gap-[22px]">
		<SkipBack size={20} class="text-muted-foreground" />
		<button
			type="button"
			onclick={() => (playing = !playing)}
			aria-label={playing ? "Pause" : "Play"}
			class="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md"
		>
			{#if playing}
				<Pause size={20} class="fill-current" />
			{:else}
				<Play size={20} class="fill-current" />
			{/if}
		</button>
		<SkipForward size={20} class="text-muted-foreground" />
	</div>
</div>
