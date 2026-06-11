<script lang="ts">
	import { Heart } from "@lucide/svelte";

	const base = "?w=160&h=160&q=60&auto=format&fit=crop";
	const photos = [
		`https://images.unsplash.com/photo-1452587925148-ce544e77e70d${base}`,
		`https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f${base}`,
		`https://images.unsplash.com/photo-1481833761820-0509d3217039${base}`,
		`https://images.unsplash.com/photo-1464822759023-fed622ff2c3b${base}`,
	];
</script>

<div
	class="flex w-full max-w-[270px] flex-col rounded-xl border border-border bg-card p-3.5 text-card-foreground shadow-md transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lg"
>
	<div class="mb-3 grid grid-cols-2 gap-1.5">
		{#each photos.slice(0, 3) as src, i (i)}
			<img
				{src}
				alt="Studio shoot photo {i + 1}"
				loading="lazy"
				class="h-[86px] w-full rounded-sm object-cover"
			/>
		{/each}
		<div class="relative">
			<img src={photos[3]} alt="" loading="lazy" class="h-[86px] w-full rounded-sm object-cover" />
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
