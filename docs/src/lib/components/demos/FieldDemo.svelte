<script lang="ts">
	import { Field, FieldLabel, FieldControl, FieldDescription, FieldError } from "$registry/field";
	import { Input } from "$registry/input";

	let email = $state("");
	let error = $state("");

	function validate() {
		if (!email) {
			error = "Email is required.";
		} else if (!email.includes("@")) {
			error = "Please enter a valid email address.";
		} else {
			error = "";
		}
	}
</script>

<div class="w-full max-w-sm">
	<Field {error}>
		<FieldLabel>Email</FieldLabel>
		<FieldControl>
			{#snippet child({ id, ...aria })}
				<Input
					{id}
					{...aria}
					bind:value={email}
					type="email"
					placeholder="you@example.com"
					onblur={validate}
				/>
			{/snippet}
		</FieldControl>
		<FieldDescription>We'll never share your email.</FieldDescription>
		<FieldError />
	</Field>
</div>
