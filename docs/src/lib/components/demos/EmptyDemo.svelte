<script lang="ts">
	import {
		Empty,
		EmptyHeader,
		EmptyMedia,
		EmptyTitle,
		EmptyDescription,
		EmptyContent,
	} from "$registry/empty";
	import { Button } from "$registry/button";
</script>

<Empty>
	<EmptyHeader>
		<EmptyMedia variant="icon">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25" />
				<path d="m8 16 4-4 4 4" />
				<path d="M12 12v9" />
			</svg>
		</EmptyMedia>
		<EmptyTitle>No items yet</EmptyTitle>
		<EmptyDescription>Get started by creating your first item.</EmptyDescription>
	</EmptyHeader>
	<EmptyContent>
		<Button>Create item</Button>
	</EmptyContent>
</Empty>
