<script lang="ts">
	import { ArrowUpRight } from "@lucide/svelte";
</script>

<div
	class="flex w-full max-w-[300px] flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-md transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lg"
>
	<img
		src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&q=60&auto=format&fit=crop"
		alt="Mountains in fog"
		loading="lazy"
		class="h-[150px] w-full object-cover"
	/>
	<div class="p-[18px]">
		<div class="mb-2.5 flex items-center gap-2">
			<span
				class="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-[11px] font-bold uppercase leading-none tracking-wide text-primary"
			>
				Design
			</span>
			<span class="text-xs text-muted-foreground/70">6 min read</span>
		</div>
		<h3 class="font-display text-xl font-bold leading-tight tracking-tight">
			A field guide to designing with tokens
		</h3>
		<p class="my-2 mb-4 text-[13.5px] leading-relaxed text-muted-foreground">
			How a small set of semantic variables can carry an entire product across light, dark and brand
			themes.
		</p>
		<div class="flex items-center gap-2.5">
			<span
				class="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full bg-primary/15 font-display text-xs font-bold text-primary"
			>
				LP
			</span>
			<div class="text-xs">
				<span class="font-semibold">Leo Park</span>
				<span class="text-muted-foreground/70"> · Mar 14</span>
			</div>
			<ArrowUpRight size={15} class="ml-auto text-muted-foreground/70" />
		</div>
	</div>
</div>
