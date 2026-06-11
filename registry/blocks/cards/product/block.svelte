<script lang="ts">
	import { Package, Heart, Star, ShoppingBag, Check } from "@lucide/svelte";

	let liked = $state(false);
	let added = $state(false);
</script>

<div
	class="flex w-full max-w-[250px] flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-md transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lg"
>
	<div class="relative">
		<div
			class="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 to-muted"
		>
			<div class="absolute -right-5 -top-5 h-28 w-28 rounded-full bg-primary opacity-10"></div>
			<Package size={30} class="relative text-primary opacity-60" />
		</div>
		<span
			class="absolute left-3 top-3 inline-flex items-center rounded-full bg-destructive/10 px-2 py-1 text-[11px] font-bold uppercase leading-none tracking-wide text-destructive"
		>
			−20%
		</span>
		<button
			type="button"
			onclick={() => (liked = !liked)}
			aria-label="Save"
			class="absolute right-2.5 top-2.5 flex h-[34px] w-[34px] items-center justify-center rounded-full bg-card shadow-md transition {liked
				? 'text-destructive'
				: 'text-muted-foreground'}"
		>
			<Heart size={17} class={liked ? "fill-destructive" : ""} />
		</button>
	</div>
	<div class="p-4">
		<div class="text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground/70">
			Ceramics
		</div>
		<div class="mt-0.5 font-display text-[16.5px] font-bold">Stoneware Mug</div>
		<div class="mt-2 flex items-baseline gap-2">
			<span class="font-display text-xl font-extrabold">$28</span>
			<span class="text-[13px] text-muted-foreground/70 line-through">$35</span>
			<span class="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
				<Star size={13} class="fill-amber-500 text-amber-500" /> 4.9
			</span>
		</div>
		<button
			type="button"
			onclick={() => (added = !added)}
			class="mt-3.5 inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-semibold transition {added
				? 'bg-primary/10 text-primary'
				: 'bg-primary text-primary-foreground hover:brightness-110'}"
		>
			{#if added}
				<Check size={15} /> Added
			{:else}
				<ShoppingBag size={15} /> Add to bag
			{/if}
		</button>
	</div>
</div>
