<script lang="ts">
	import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "$registry/collapsible";

	let open = $state(false);
</script>

<div class="w-full max-w-sm">
	<Collapsible bind:open class="space-y-2">
		<div class="flex items-center justify-between space-x-4 px-4">
			<h4 class="text-sm font-semibold">@bosia/ui starred 3 repositories</h4>
			<CollapsibleTrigger class="rounded-md border px-2 py-1 text-sm hover:bg-accent">
				{open ? "Hide" : "Show"}
			</CollapsibleTrigger>
		</div>
		<div class="rounded-md border px-4 py-2 font-mono text-sm shadow-sm">bosia/framework</div>
		<CollapsibleContent class="space-y-2">
			<div class="rounded-md border px-4 py-2 font-mono text-sm shadow-sm">
				bosia/registry
			</div>
			<div class="rounded-md border px-4 py-2 font-mono text-sm shadow-sm">bosia/docs</div>
		</CollapsibleContent>
	</Collapsible>
</div>
