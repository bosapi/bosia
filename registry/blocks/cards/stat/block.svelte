<script lang="ts">
	import { Wallet } from "@lucide/svelte";
</script>

<div
	class="flex w-full max-w-[260px] flex-col rounded-xl border border-border bg-card p-5 text-card-foreground shadow-md transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lg"
>
	<div class="flex items-start justify-between">
		<div class="flex items-center gap-2.5">
			<span
				class="flex h-[34px] w-[34px] items-center justify-center rounded-lg bg-primary/10 text-primary"
			>
				<Wallet size={18} />
			</span>
			<span class="text-[13px] font-semibold text-muted-foreground">Revenue</span>
		</div>
		<span
			class="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] font-bold uppercase leading-none tracking-wide text-emerald-600 dark:text-emerald-400"
		>
			+12.4%
		</span>
	</div>

	<div class="mb-0.5 mt-3.5 font-display text-[36px] font-extrabold tabular-nums tracking-tight">
		$24,890
	</div>
	<div class="mb-3 text-xs text-muted-foreground/70">vs $22,140 last month</div>

	<svg viewBox="0 0 220 38" class="block h-[38px] w-full overflow-visible text-primary">
		<path
			d="M0 36 L24.4 24.7 L48.9 32.2 L73.3 20.9 L97.8 28.4 L122.2 17.1 L146.7 24.7 L171.1 9.6 L195.6 13.3 L220 2 L220 38 L0 38 Z"
			class="fill-primary/10"
		/>
		<path
			d="M0 36 L24.4 24.7 L48.9 32.2 L73.3 20.9 L97.8 28.4 L122.2 17.1 L146.7 24.7 L171.1 9.6 L195.6 13.3 L220 2"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<circle cx="220" cy="2" r="3" class="fill-primary" />
	</svg>
</div>
