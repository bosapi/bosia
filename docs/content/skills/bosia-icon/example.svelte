<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Badge } from "$lib/components/ui/badge";
	import { ChevronRight, Search, CheckCircle2, Trash2 } from "@lucide/svelte";

	const rows = [
		{ id: 1, label: "Onboarding checklist" },
		{ id: 2, label: "Q3 retrospective" },
		{ id: 3, label: "Hiring plan" },
	];
</script>

<div class="flex max-w-md flex-col gap-4">
	<div class="flex items-center gap-2">
		<Button variant="default" size="sm">
			<Search class="mr-2 size-4" />
			Search
		</Button>
		<Button variant="outline" size="sm">
			<Trash2 class="mr-2 size-4" />
			Delete
		</Button>
		<Badge variant="secondary" class="ml-auto">
			<CheckCircle2 class="mr-1 size-3" />
			Saved
		</Badge>
	</div>

	<ul class="divide-y divide-border rounded-md border border-border bg-card">
		{#each rows as row (row.id)}
			<li class="flex items-center justify-between p-4">
				<span class="text-card-foreground">{row.label}</span>
				<ChevronRight class="size-4 text-muted-foreground" />
			</li>
		{/each}
	</ul>
</div>
