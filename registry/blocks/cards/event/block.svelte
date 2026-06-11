<script lang="ts">
	import { Clock, MapPin } from "@lucide/svelte";

	const attendees = ["AR", "LP", "PS"];
</script>

<div
	class="flex w-full max-w-[300px] gap-4 rounded-xl border border-border bg-card p-[18px] text-card-foreground shadow-md transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lg"
>
	<div class="w-14 flex-none overflow-hidden rounded-lg border border-border text-center">
		<div
			class="bg-primary py-1 text-[11px] font-bold uppercase tracking-wider text-primary-foreground"
		>
			Jun
		</div>
		<div class="py-1 font-display text-[26px] font-extrabold">14</div>
	</div>
	<div class="min-w-0 flex-1">
		<span
			class="mb-1.5 inline-flex items-center rounded-full bg-muted px-2 py-1 text-[11px] font-bold uppercase leading-none tracking-wide text-muted-foreground"
		>
			In-person
		</span>
		<div class="font-display text-[16.5px] font-bold leading-tight">Design Systems Meetup</div>
		<div class="my-2.5 mb-3 flex flex-col gap-1.5 text-xs text-muted-foreground">
			<span class="flex items-center gap-1.5"><Clock size={14} /> 6:30 PM · 2h</span>
			<span class="flex items-center gap-1.5"><MapPin size={14} /> Second Home, Lisbon</span>
		</div>
		<div class="flex items-center gap-2">
			<div class="flex">
				{#each attendees as a, i (a)}
					<span
						class="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 font-display text-[10px] font-bold text-primary shadow-[0_0_0_2px_hsl(var(--card))] {i >
						0
							? '-ml-2'
							: ''}"
					>
						{a}
					</span>
				{/each}
			</div>
			<span class="text-xs text-muted-foreground/70">+38 going</span>
		</div>
	</div>
</div>
