<script lang="ts">
	import { Label } from "$registry/label";
	import { Input } from "$registry/input";
</script>

<div class="flex flex-col gap-6 w-full max-w-sm">
	<div class="grid gap-1.5">
		<Label for="email">Email</Label>
		<Input type="email" id="email" placeholder="you@example.com" />
	</div>
	<div class="grid gap-1.5">
		<Label for="name">Name</Label>
		<Input id="name" placeholder="Your name" />
	</div>
	<div class="grid gap-1.5">
		<Input id="disabled" disabled placeholder="Disabled input" class="peer" />
		<Label for="disabled">Disabled (label dims automatically)</Label>
	</div>
</div>
