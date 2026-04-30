<script lang="ts">
	import { Kbd, KbdGroup } from "$registry/kbd";

	let lastPressed = $state("");
</script>

<div class="flex flex-col gap-4">
	<div class="flex flex-wrap items-center gap-6">
		<Kbd>K</Kbd>

		<KbdGroup><Kbd>⌘</Kbd><Kbd>K</Kbd></KbdGroup>

		<KbdGroup><Kbd>Ctrl</Kbd><Kbd>C</Kbd></KbdGroup>

		<KbdGroup><Kbd>Ctrl</Kbd><Kbd>V</Kbd></KbdGroup>

		<KbdGroup><Kbd>⌘</Kbd><Kbd>Shift</Kbd><Kbd>P</Kbd></KbdGroup>
	</div>

	<div class="flex flex-wrap items-center gap-4">
		<span class="text-sm text-muted-foreground">Try pressing:</span>
		<KbdGroup onPress={() => (lastPressed = "Ctrl+J")}>
			<Kbd>Ctrl</Kbd><Kbd>J</Kbd>
		</KbdGroup>
	</div>

	{#if lastPressed}
		<p class="text-sm text-muted-foreground">
			Pressed: <strong>{lastPressed}</strong>
		</p>
	{/if}
</div>
