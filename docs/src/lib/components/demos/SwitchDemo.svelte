<script lang="ts">
	import { Switch } from "$registry/switch";
	import { Label } from "$registry/label";

	let enabled = $state(false);
</script>

<div class="flex flex-col gap-6">
	<!-- Basic switch with label -->
	<div class="flex items-center gap-2">
		<Switch id="airplane" bind:checked={enabled} />
		<Label for="airplane">Airplane Mode</Label>
	</div>
	<p class="text-sm text-muted-foreground">
		Airplane mode is {enabled ? "on" : "off"}.
	</p>

	<!-- Disabled (checked) -->
	<div class="flex items-center gap-2">
		<Switch id="disabled" disabled checked />
		<Label for="disabled" class="opacity-50">Disabled (on)</Label>
	</div>

	<!-- With form name -->
	<div class="flex items-center gap-2">
		<Switch id="notifications" name="notifications" value="yes" />
		<Label for="notifications">Enable notifications</Label>
	</div>
</div>
