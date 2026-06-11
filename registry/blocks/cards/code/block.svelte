<script lang="ts">
	import { Copy, Check } from "@lucide/svelte";

	let copied = $state(false);

	function copy() {
		copied = true;
		setTimeout(() => (copied = false), 1200);
	}
</script>

<div
	class="flex w-full max-w-[320px] flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-md transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lg"
>
	<div class="flex items-center gap-2 border-b border-border bg-secondary px-3.5 py-2.5">
		<span class="flex gap-1.5">
			<span class="h-[11px] w-[11px] rounded-full bg-destructive"></span>
			<span class="h-[11px] w-[11px] rounded-full bg-amber-500"></span>
			<span class="h-[11px] w-[11px] rounded-full bg-emerald-500"></span>
		</span>
		<span class="ml-1 font-mono text-xs text-muted-foreground">theme.css</span>
		<button
			type="button"
			onclick={copy}
			class="ml-auto flex items-center gap-1.5 text-xs font-semibold transition {copied
				? 'text-emerald-600 dark:text-emerald-400'
				: 'text-muted-foreground'}"
		>
			{#if copied}<Check size={14} /> Copied{:else}<Copy size={14} /> Copy{/if}
		</button>
	</div>
	<pre class="m-0 overflow-hidden p-4 font-mono text-[12.5px] leading-relaxed"><span
			class="text-muted-foreground/70">:root</span
		> {"{"}
  <span class="text-primary">--primary</span>: <span class="text-emerald-600 dark:text-emerald-400"
			>263 100% 74%</span
		>;
  <span class="text-primary">--radius</span>:  <span class="text-emerald-600 dark:text-emerald-400"
			>0.875rem</span
		>;
{"}"}</pre>
</div>
