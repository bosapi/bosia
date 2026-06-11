<script lang="ts">
	import { CircleCheck } from "@lucide/svelte";
</script>

<div
	class="flex w-full max-w-[320px] items-start gap-3 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-md"
>
	<span
		class="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
	>
		<CircleCheck size={20} />
	</span>
	<div class="min-w-0 flex-1">
		<div class="flex items-center justify-between">
			<span class="text-sm font-bold">Payment received</span>
			<span class="text-[11.5px] text-muted-foreground/70">2m</span>
		</div>
		<p class="mb-2.5 mt-1 text-[13px] leading-snug text-muted-foreground">
			Invoice <b class="font-semibold text-foreground">#2041</b> was paid by Northwind Studio.
		</p>
		<div class="flex gap-2">
			<button
				type="button"
				class="inline-flex items-center justify-center rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:brightness-110"
			>
				View receipt
			</button>
			<button
				type="button"
				class="inline-flex items-center justify-center rounded-lg border border-input bg-transparent px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-secondary"
			>
				Dismiss
			</button>
		</div>
	</div>
</div>
