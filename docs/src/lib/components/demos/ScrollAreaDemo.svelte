<script lang="ts">
	import { ScrollArea } from "$registry/scroll-area";
</script>

<div class="flex flex-col gap-6 w-full max-w-sm">
	<div>
		<p class="text-sm text-muted-foreground mb-2">Vertical</p>
		<ScrollArea class="h-48 rounded-md border p-4">
			{#each Array.from({ length: 20 }, (_, i) => i + 1) as n}
				<div class="py-1 text-sm">Item {n}</div>
			{/each}
		</ScrollArea>
	</div>
	<div>
		<p class="text-sm text-muted-foreground mb-2">Horizontal</p>
		<ScrollArea class="rounded-md border p-4" orientation="horizontal">
			<div class="flex gap-4" style="width: max-content">
				{#each Array.from({ length: 20 }, (_, i) => i + 1) as n}
					<div
						class="shrink-0 w-24 h-16 rounded bg-muted flex items-center justify-center text-sm"
					>
						Item {n}
					</div>
				{/each}
			</div>
		</ScrollArea>
	</div>
</div>
