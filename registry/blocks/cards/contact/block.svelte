<script lang="ts">
	import { Mail, Phone, MessageCircle, Video, Ellipsis } from "@lucide/svelte";
</script>

<div
	class="flex w-full max-w-[300px] flex-col rounded-xl border border-border bg-card p-[18px] text-card-foreground shadow-md transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lg"
>
	<div class="flex items-center gap-3">
		<span
			class="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-primary/15 font-display text-base font-bold text-primary"
		>
			MB
		</span>
		<div class="min-w-0 flex-1">
			<div class="flex items-center gap-1.5">
				<span class="font-display text-base font-bold">Marcus Bell</span>
				<span class="h-[7px] w-[7px] flex-none rounded-full bg-emerald-500"></span>
			</div>
			<div class="text-xs text-muted-foreground">Engineering Lead</div>
		</div>
		<span
			class="inline-flex items-center rounded-full bg-muted px-2 py-1 text-[11px] font-bold uppercase leading-none tracking-wide text-muted-foreground"
		>
			PST
		</span>
	</div>

	<div class="my-4 flex flex-col gap-2.5 text-[13px] text-muted-foreground">
		<div class="flex items-center gap-2.5"><Mail size={15} /> marcus@bosia.dev</div>
		<div class="flex items-center gap-2.5"><Phone size={15} /> +1 (415) 555-0198</div>
	</div>

	<div class="flex gap-2">
		<button
			type="button"
			class="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition hover:brightness-110"
		>
			<MessageCircle size={15} /> Message
		</button>
		<button
			type="button"
			class="inline-flex items-center justify-center rounded-lg border border-input bg-transparent px-3 py-2 text-foreground transition hover:bg-secondary"
		>
			<Video size={15} />
		</button>
		<button
			type="button"
			class="inline-flex items-center justify-center rounded-lg border border-input bg-transparent px-3 py-2 text-foreground transition hover:bg-secondary"
		>
			<Ellipsis size={15} />
		</button>
	</div>
</div>
