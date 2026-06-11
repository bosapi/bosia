<script lang="ts">
	import { Quote, Star } from "@lucide/svelte";
</script>

<div
	class="flex w-full max-w-[320px] flex-col rounded-xl border border-border bg-card p-[22px] text-card-foreground shadow-md"
>
	<Quote size={26} class="text-primary" />
	<p class="mb-[18px] mt-3 font-display text-[19px] font-medium italic leading-snug tracking-tight">
		We reskinned the entire dashboard in an afternoon. One token swap and every card just… belonged.
	</p>
	<div class="flex items-center gap-3">
		<span
			class="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-primary/15 font-display text-sm font-bold text-primary"
		>
			PS
		</span>
		<div>
			<div class="text-sm font-bold">Priya Shah</div>
			<div class="text-xs text-muted-foreground/70">Head of Design, Northwind</div>
		</div>
		<div class="ml-auto flex gap-0.5 text-amber-500">
			{#each [0, 1, 2, 3, 4] as i (i)}
				<Star size={14} class="fill-amber-500" />
			{/each}
		</div>
	</div>
</div>
