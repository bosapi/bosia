<script lang="ts">
	import { Skeleton } from "$registry/skeleton";
</script>

<div class="flex flex-col items-center gap-10 py-12">
	<div class="flex items-center gap-4">
		<Skeleton class="size-12 rounded-full" />
		<div class="flex flex-col gap-2">
			<Skeleton class="h-4 w-[250px]" />
			<Skeleton class="h-4 w-[200px]" />
		</div>
	</div>

	<Skeleton class="h-[125px] w-[250px] rounded-xl" />
</div>
