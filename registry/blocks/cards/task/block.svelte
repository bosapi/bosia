<script lang="ts">
	import { Check, Ellipsis } from "@lucide/svelte";

	const items = ["Audit token names", "Wire up theme switch", "Ship the gallery"];
	let done = $state([true, true, false]);
	const count = $derived(done.filter(Boolean).length);

	function toggle(i: number) {
		done[i] = !done[i];
	}
</script>

<div
	class="flex w-full max-w-[260px] flex-col rounded-xl border border-border bg-card p-[18px] text-card-foreground shadow-md transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lg"
>
	<div class="mb-1 flex items-center justify-between">
		<span
			class="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-1 text-[11px] font-bold uppercase leading-none tracking-wide text-amber-600 dark:text-amber-400"
		>
			In progress
		</span>
		<Ellipsis size={18} class="text-muted-foreground/70" />
	</div>
	<div class="mb-3.5 mt-2 font-display text-[16.5px] font-bold">Launch Bosia v2</div>
	<div class="flex flex-col gap-2.5">
		{#each items as it, i (it)}
			<button type="button" onclick={() => toggle(i)} class="flex items-center gap-2.5 text-left">
				<span
					class="flex h-[19px] w-[19px] flex-none items-center justify-center rounded-md text-primary-foreground {done[
						i
					]
						? 'bg-primary'
						: 'border-[1.5px] border-input'}"
				>
					{#if done[i]}<Check size={13} />{/if}
				</span>
				<span class="text-[13.5px] {done[i] ? 'text-muted-foreground/70 line-through' : ''}">
					{it}
				</span>
			</button>
		{/each}
	</div>
	<div class="mt-4 flex items-center gap-2.5 border-t border-border pt-3.5">
		<div class="h-1.5 flex-1 rounded-full bg-muted">
			<div
				class="h-full rounded-full bg-primary transition-[width] duration-300"
				style="width: {(count / 3) * 100}%"
			></div>
		</div>
		<span class="font-mono text-xs text-muted-foreground">{count}/3</span>
	</div>
</div>
