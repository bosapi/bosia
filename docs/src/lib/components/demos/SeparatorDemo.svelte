<script lang="ts">
	import { Separator } from "$registry/separator";
</script>

<div class="flex flex-col gap-4 w-full max-w-sm">
	<div>
		<p class="text-sm font-medium">Above</p>
		<Separator class="my-2" />
		<p class="text-sm font-medium">Below</p>
	</div>
	<div class="flex h-6 items-center gap-4">
		<span class="text-sm">Left</span>
		<Separator orientation="vertical" />
		<span class="text-sm">Center</span>
		<Separator orientation="vertical" />
		<span class="text-sm">Right</span>
	</div>
</div>
