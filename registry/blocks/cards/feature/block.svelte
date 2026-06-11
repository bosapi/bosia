<script lang="ts">
	import { Layers, ArrowRight } from "@lucide/svelte";
</script>

<div
	class="flex w-full max-w-[250px] flex-col rounded-xl border border-border bg-card p-[22px] text-card-foreground shadow-md transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lg"
>
	<span
		class="mb-4 flex h-[46px] w-[46px] items-center justify-center rounded-xl bg-primary/10 text-primary"
	>
		<Layers size={24} />
	</span>
	<h3 class="mb-2 font-display text-[19px] font-bold">Layer & restack</h3>
	<p class="mb-4 text-[13.5px] leading-relaxed text-muted-foreground">
		Every card is a token-driven shell. Compose, theme and restack them without touching a single
		hex value.
	</p>
	<span class="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary">
		Learn more <ArrowRight size={15} />
	</span>
</div>
