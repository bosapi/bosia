<script lang="ts">
	import { Checkbox } from "$registry/checkbox";
	import { Label } from "$registry/label";

	let agreed = $state(false);
</script>

<div class="flex flex-col gap-6">
	<!-- Basic checkbox with label -->
	<div class="flex items-center gap-2">
		<Checkbox id="terms" bind:checked={agreed} />
		<Label for="terms">Accept terms and conditions</Label>
	</div>
	<p class="text-sm text-muted-foreground">
		You {agreed ? "agreed" : "have not agreed"} to the terms.
	</p>

	<!-- Disabled -->
	<div class="flex items-center gap-2">
		<Checkbox id="disabled" disabled checked />
		<Label for="disabled" class="opacity-50">Disabled (checked)</Label>
	</div>

	<!-- Indeterminate -->
	<div class="flex items-center gap-2">
		<Checkbox id="indeterminate" indeterminate />
		<Label for="indeterminate">Indeterminate</Label>
	</div>
</div>
