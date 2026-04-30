<script lang="ts">
	import { Form } from "$registry/form";
	import { Field, FieldLabel, FieldControl, FieldDescription, FieldError } from "$registry/field";
	import { Input } from "$registry/input";
	import { Button } from "$registry/button";

	function validate(data: FormData): Record<string, string> {
		const errors: Record<string, string> = {};
		const email = data.get("email") as string;
		const password = data.get("password") as string;

		if (!email) {
			errors.email = "Email is required.";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			errors.email = "Please enter a valid email address.";
		}

		if (!password) {
			errors.password = "Password is required.";
		} else if (password.length < 8) {
			errors.password = "Password must be at least 8 characters.";
		}

		return errors;
	}

	function handleSubmit(data: FormData) {
		alert(`Logged in as ${data.get("email")}`);
	}
</script>

<div class="w-full max-w-sm">
	<Form {validate} onsubmit={handleSubmit} class="grid gap-4">
		<Field name="email">
			<FieldLabel>Email</FieldLabel>
			<FieldControl>
				{#snippet child({ id, ...aria })}
					<Input {id} {...aria} name="email" type="email" placeholder="you@example.com" />
				{/snippet}
			</FieldControl>
			<FieldDescription>We'll never share your email.</FieldDescription>
			<FieldError />
		</Field>

		<Field name="password">
			<FieldLabel>Password</FieldLabel>
			<FieldControl>
				{#snippet child({ id, ...aria })}
					<Input
						{id}
						{...aria}
						name="password"
						type="password"
						placeholder="Enter password"
					/>
				{/snippet}
			</FieldControl>
			<FieldDescription>Must be at least 8 characters.</FieldDescription>
			<FieldError />
		</Field>

		<Button type="submit">Log in</Button>
	</Form>
</div>
