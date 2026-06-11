<script lang="ts">
	import { FileText, Download } from "@lucide/svelte";
</script>

<div
	class="flex w-full max-w-[250px] flex-col rounded-xl border border-border bg-card p-4 text-card-foreground shadow-md transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lg"
>
	<div class="flex items-center gap-3">
		<span
			class="flex h-[42px] w-[42px] flex-none items-center justify-center rounded-lg bg-destructive/10 text-destructive"
		>
			<FileText size={20} />
		</span>
		<div class="min-w-0 flex-1">
			<div class="truncate text-sm font-semibold">Brand Guidelines.pdf</div>
			<div class="font-mono text-xs text-muted-foreground/70">4.2 MB · PDF</div>
		</div>
		<Download size={18} class="text-muted-foreground" />
	</div>
	<div class="mt-3.5">
		<div class="h-1.5 rounded-full bg-muted">
			<div class="h-full w-[78%] rounded-full bg-primary"></div>
		</div>
		<div class="mt-1.5 flex justify-between text-[11.5px] text-muted-foreground/70">
			<span>Downloading…</span><span class="font-mono">78%</span>
		</div>
	</div>
</div>
