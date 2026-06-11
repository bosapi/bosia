<script lang="ts">
	import { MapPin, Navigation, Bookmark } from "@lucide/svelte";
</script>

<div
	class="flex w-full max-w-[290px] flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-md transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lg"
>
	<div class="relative h-[150px] overflow-hidden bg-muted">
		<div
			class="absolute inset-0 opacity-50 [background-image:linear-gradient(hsl(var(--border))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border))_1px,transparent_1px)] [background-size:26px_26px]"
		></div>
		<div
			class="absolute -left-2.5 top-[30px] h-3 w-[200px] rotate-[18deg] rounded-md bg-input opacity-70"
		></div>
		<div
			class="absolute bottom-6 left-5 h-2.5 w-[220px] -rotate-[9deg] rounded-md bg-input opacity-60"
		></div>
		<div
			class="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 text-primary drop-shadow"
		>
			<MapPin size={34} class="fill-primary" />
		</div>
	</div>
	<div class="p-4">
		<div class="font-display text-base font-bold">Second Home</div>
		<div class="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
			<MapPin size={13} /> Mercado, Lisbon · 0.8 km
		</div>
		<div class="mt-3.5 flex gap-2">
			<button
				type="button"
				class="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition hover:brightness-110"
			>
				<Navigation size={14} /> Directions
			</button>
			<button
				type="button"
				class="inline-flex items-center justify-center rounded-lg border border-input bg-transparent px-3 py-2 text-foreground transition hover:bg-secondary"
			>
				<Bookmark size={15} />
			</button>
		</div>
	</div>
</div>
