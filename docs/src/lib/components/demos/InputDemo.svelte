<script lang="ts">
	import { Input } from "$registry/input";
	import { Label } from "$registry/label";

	let value = $state("");
</script>

<div class="flex flex-col gap-4 w-full max-w-sm">
	<div class="grid gap-1.5">
		<Label for="text">Text</Label>
		<Input id="text" bind:value placeholder="Type something..." />
		{#if value}
			<p class="text-sm text-muted-foreground">Value: <strong>{value}</strong></p>
		{/if}
	</div>
	<div class="grid gap-1.5">
		<Label for="email">Email</Label>
		<Input type="email" id="email" placeholder="you@example.com" />
	</div>
	<div class="grid gap-1.5">
		<Input id="disabled" disabled placeholder="Disabled input" class="peer" />
		<Label for="disabled">Disabled (label dims automatically)</Label>
	</div>
</div>
