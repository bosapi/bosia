<script lang="ts">
	import { ResizablePaneGroup, ResizablePane, ResizableHandle } from "$registry/resizable";
</script>

<ResizablePaneGroup direction="horizontal" class="max-w-md rounded-lg border">
	<ResizablePane class="flex items-center justify-center p-6">
		<span class="font-semibold">One</span>
	</ResizablePane>
	<ResizableHandle withHandle />
	<ResizablePane>
		<ResizablePaneGroup direction="vertical">
			<ResizablePane class="flex items-center justify-center p-6">
				<span class="font-semibold">Two</span>
			</ResizablePane>
			<ResizableHandle />
			<ResizablePane class="flex items-center justify-center p-6">
				<span class="font-semibold">Three</span>
			</ResizablePane>
		</ResizablePaneGroup>
	</ResizablePane>
</ResizablePaneGroup>
