<script lang="ts">
	import { Spinner } from "$registry/spinner";
	import { Button } from "$registry/button";
</script>

<div class="flex flex-col items-center gap-10 py-12">
	<div class="flex items-end gap-8">
		<Spinner />
		<Spinner class="size-6" />
		<Spinner class="size-8" />
		<Spinner class="size-10" />
	</div>

	<div class="flex items-center gap-8">
		<Spinner class="size-6 text-primary" />
		<Spinner class="size-6 text-destructive" />
		<Spinner class="size-6 text-muted-foreground" />
	</div>

	<Button disabled class="gap-2">
		<Spinner aria-hidden="true" />
		Loading...
	</Button>
</div>
