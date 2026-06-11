<script lang="ts">
	import { CreditCard, ArrowUpRight, ArrowDownLeft } from "@lucide/svelte";
</script>

<div
	class="flex w-full max-w-[300px] flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-md transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lg"
>
	<div class="bg-foreground p-5 text-background">
		<div class="flex items-center justify-between">
			<span class="text-xs font-medium opacity-70">Available balance</span>
			<CreditCard size={20} />
		</div>
		<div class="mt-2 font-display text-[34px] font-extrabold tabular-nums tracking-tight">
			$8,420.50
		</div>
		<div class="mt-3.5 font-mono text-[13px] tracking-[0.15em] opacity-80">•••• •••• •••• 4291</div>
	</div>
	<div class="flex gap-2 p-4">
		<button
			type="button"
			class="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/15"
		>
			<ArrowUpRight size={15} /> Send
		</button>
		<button
			type="button"
			class="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-input bg-transparent px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-secondary"
		>
			<ArrowDownLeft size={15} /> Request
		</button>
	</div>
</div>
