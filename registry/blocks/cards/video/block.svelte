<script lang="ts">
	import { Video, Play } from "@lucide/svelte";
</script>

<div
	class="flex w-full max-w-[290px] flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-md transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lg"
>
	<div class="relative">
		<div
			class="flex h-[164px] items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 to-muted"
		>
			<Video size={30} class="text-primary opacity-60" />
		</div>
		<div class="absolute inset-0 flex items-center justify-center">
			<span
				class="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-white/90 text-neutral-900 shadow-lg"
			>
				<Play size={22} class="fill-current" />
			</span>
		</div>
		<span
			class="absolute bottom-2.5 right-2.5 rounded-sm bg-black/70 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-white"
		>
			12:04
		</span>
	</div>
	<div class="flex gap-3 p-4">
		<span
			class="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-primary/15 font-display text-xs font-bold text-primary"
		>
			BT
		</span>
		<div class="min-w-0">
			<div class="font-display text-[15px] font-bold leading-snug">
				Building a themeable card system
			</div>
			<div class="mt-1 text-xs text-muted-foreground/70">Bosia TV · 24K views · 2d ago</div>
		</div>
	</div>
</div>
