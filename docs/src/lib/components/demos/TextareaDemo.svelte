<script lang="ts">
	import { Textarea } from "$registry/textarea";
	import { Label } from "$registry/label";

	let value = $state("");
</script>

<div class="flex flex-col gap-4 w-full max-w-sm">
	<div class="grid gap-1.5">
		<Label for="message">Message</Label>
		<Textarea id="message" bind:value placeholder="Type your message..." />
		{#if value}
			<p class="text-sm text-muted-foreground">Value: <strong>{value}</strong></p>
		{/if}
	</div>
	<div class="grid gap-1.5">
		<Label for="bio">Bio</Label>
		<Textarea id="bio" placeholder="Tell us about yourself..." />
	</div>
	<div class="grid gap-1.5">
		<Textarea id="disabled" disabled placeholder="Disabled textarea" class="peer" />
		<Label for="disabled">Disabled (label dims automatically)</Label>
	</div>
</div>
