<script lang="ts">
	import { Image, Mountain, Camera, Heart } from "@lucide/svelte";

	const tiles = [Image, Mountain, Camera];
</script>

<div
	class="flex w-full max-w-[270px] flex-col rounded-xl border border-border bg-card p-3.5 text-card-foreground shadow-md transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lg"
>
	<div class="mb-3 grid grid-cols-2 gap-1.5">
		{#each tiles as Tile, i (i)}
			<div
				class="flex h-[86px] items-center justify-center overflow-hidden rounded-sm bg-gradient-to-br from-primary/10 to-muted"
			>
				<Tile size={26} class="text-primary opacity-60" />
			</div>
		{/each}
		<div class="relative">
			<div
				class="flex h-[86px] items-center justify-center overflow-hidden rounded-sm bg-gradient-to-br from-primary/10 to-muted"
			>
				<Image size={26} class="text-primary opacity-60" />
			</div>
			<div
				class="absolute inset-0 flex items-center justify-center rounded-sm bg-black/50 font-display text-[17px] font-bold text-white"
			>
				+24
			</div>
		</div>
	</div>
	<div class="flex items-center justify-between">
		<div>
			<div class="font-display text-[15.5px] font-bold">Studio shoot</div>
			<div class="text-xs text-muted-foreground/70">28 photos · Apr 2</div>
		</div>
		<Heart size={18} class="text-muted-foreground/70" />
	</div>
</div>
