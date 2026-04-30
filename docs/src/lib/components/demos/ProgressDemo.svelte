<script lang="ts">
	import { Progress } from "$registry/progress";

	let value = $state(13);

	$effect(() => {
		const timer = setTimeout(() => {
			value = 66;
		}, 500);
		return () => clearTimeout(timer);
	});
</script>

<div class="flex flex-col items-center gap-10 py-12 w-full">
	<Progress {value} class="w-[60%]" />
</div>
