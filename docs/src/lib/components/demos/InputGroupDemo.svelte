<script lang="ts">
	import {
		InputGroup,
		InputGroupInput,
		InputGroupTextarea,
		InputGroupAddon,
		InputGroupButton,
		InputGroupText,
	} from "$registry/input-group";

	let query = $state("");
	let amount = $state("");
	let url = $state("");
	let message = $state("");
</script>

<div class="flex w-full max-w-sm flex-col gap-4">
	<InputGroup>
		<InputGroupAddon>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="size-4"
			>
				<circle cx="11" cy="11" r="8" />
				<path d="m21 21-4.3-4.3" />
			</svg>
		</InputGroupAddon>
		<InputGroupInput bind:value={query} placeholder="Search..." />
	</InputGroup>

	<InputGroup>
		<InputGroupAddon>
			<InputGroupText>$</InputGroupText>
		</InputGroupAddon>
		<InputGroupInput bind:value={amount} type="number" placeholder="0.00" />
		<InputGroupAddon align="inline-end">
			<InputGroupText>USD</InputGroupText>
		</InputGroupAddon>
	</InputGroup>

	<InputGroup>
		<InputGroupAddon>
			<InputGroupText>https://</InputGroupText>
		</InputGroupAddon>
		<InputGroupInput bind:value={url} placeholder="example.com" />
		<InputGroupAddon align="inline-end">
			<InputGroupButton size="xs">Copy</InputGroupButton>
		</InputGroupAddon>
	</InputGroup>

	<InputGroup>
		<InputGroupTextarea bind:value={message} placeholder="Type a message..." />
		<InputGroupAddon align="block-end">
			<InputGroupText class="text-xs">{message.length} chars</InputGroupText>
			<InputGroupButton size="xs" class="ml-auto">Send</InputGroupButton>
		</InputGroupAddon>
	</InputGroup>
</div>
