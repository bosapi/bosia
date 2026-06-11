<script lang="ts">
	import { BadgeCheck, Star, ThumbsUp, MessageCircle } from "@lucide/svelte";
</script>

<div
	class="flex w-full max-w-[300px] flex-col rounded-xl border border-border bg-card p-5 text-card-foreground shadow-md transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lg"
>
	<div class="mb-3 flex items-center gap-3">
		<span
			class="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-primary/15 font-display text-sm font-bold text-primary"
		>
			SO
		</span>
		<div class="flex-1">
			<div class="text-sm font-bold">Sam Okafor</div>
			<div class="text-xs text-muted-foreground/70">Verified purchase · 3 days ago</div>
		</div>
		<span
			class="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] font-bold uppercase leading-none tracking-wide text-emerald-600 dark:text-emerald-400"
		>
			<BadgeCheck size={12} /> 5.0
		</span>
	</div>
	<div class="mb-2.5 flex gap-0.5 text-amber-500">
		{#each [0, 1, 2, 3, 4] as i (i)}
			<Star size={16} class="fill-amber-500" />
		{/each}
	</div>
	<p class="mb-3.5 text-[13.5px] leading-relaxed">
		Swapped our whole admin to the Carbon theme in a day. The cards just snapped into the new look —
		zero rework.
	</p>
	<div class="flex items-center gap-4 text-xs text-muted-foreground">
		<span class="flex items-center gap-1.5"><ThumbsUp size={15} /> Helpful (42)</span>
		<span class="flex items-center gap-1.5"><MessageCircle size={15} /> Reply</span>
	</div>
</div>
