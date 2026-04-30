<script lang="ts">
	import { Tooltip, TooltipTrigger, TooltipContent } from "$registry/tooltip";
	import { Button } from "$registry/button";
</script>

<div class="flex flex-col items-center gap-10 py-12">
	<div class="flex flex-wrap items-center justify-center gap-6">
		<Tooltip>
			<TooltipTrigger>
				<Button variant="outline">Top</Button>
			</TooltipTrigger>
			<TooltipContent side="top">Add to library</TooltipContent>
		</Tooltip>

		<Tooltip>
			<TooltipTrigger>
				<Button variant="outline">Right</Button>
			</TooltipTrigger>
			<TooltipContent side="right">Share link</TooltipContent>
		</Tooltip>

		<Tooltip>
			<TooltipTrigger>
				<Button variant="outline">Bottom</Button>
			</TooltipTrigger>
			<TooltipContent side="bottom">Open settings</TooltipContent>
		</Tooltip>

		<Tooltip>
			<TooltipTrigger>
				<Button variant="outline">Left</Button>
			</TooltipTrigger>
			<TooltipContent side="left">Delete item</TooltipContent>
		</Tooltip>
	</div>

	<Tooltip delayDuration={0}>
		<TooltipTrigger>
			<Button>Instant tooltip</Button>
		</TooltipTrigger>
		<TooltipContent>No delay (delayDuration=0)</TooltipContent>
	</Tooltip>
</div>
