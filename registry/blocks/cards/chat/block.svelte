<script lang="ts">
	import { Phone, Send } from "@lucide/svelte";

	const msgs = [
		{ me: false, t: "Did the new theme tokens land?" },
		{ me: true, t: "Yep — all eighteen skins from one stylesheet now." },
		{ me: false, t: "Incredible. Shipping it." },
	];
</script>

<div
	class="flex w-full max-w-[300px] flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-md transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lg"
>
	<div class="flex items-center gap-3 border-b border-border px-4 py-3.5">
		<span
			class="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-primary/15 font-display text-xs font-bold text-primary"
		>
			AR
		</span>
		<div class="min-w-0 flex-1">
			<div class="text-sm font-bold">Ana Ruiz</div>
			<div class="flex items-center gap-1.5 text-[11.5px] text-emerald-600 dark:text-emerald-400">
				<span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>Active now
			</div>
		</div>
		<Phone size={17} class="text-muted-foreground" />
	</div>
	<div class="flex flex-col gap-2 p-4">
		{#each msgs as m, i (i)}
			<div
				class="max-w-[78%] rounded-2xl px-3 py-2 text-[13.5px] leading-snug {m.me
					? 'self-end rounded-br-sm bg-primary text-primary-foreground'
					: 'self-start rounded-bl-sm bg-muted text-foreground'}"
			>
				{m.t}
			</div>
		{/each}
	</div>
	<div class="flex items-center gap-2 border-t border-border px-3.5 py-3">
		<div class="flex-1 rounded-full bg-secondary px-3 py-2 text-[13px] text-muted-foreground/70">
			Message…
		</div>
		<span
			class="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-full bg-primary text-primary-foreground"
		>
			<Send size={16} />
		</span>
	</div>
</div>
