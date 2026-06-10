<!-- EDIT THIS FILE: add password rules, marketing copy, ToS checkbox, etc. -->
<script lang="ts">
	import type { ActionData } from "./$types";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import { Button } from "$lib/components/ui/button";
	import { Alert, AlertDescription } from "$lib/components/ui/alert";

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
	<title>Create account</title>
</svelte:head>

<main class="mx-auto flex min-h-[80vh] w-full max-w-sm flex-col justify-center gap-6 px-4 py-12">
	<div class="flex flex-col gap-1 text-center">
		<h1 class="text-2xl font-semibold tracking-tight">Create your account</h1>
		<p class="text-muted-foreground text-sm">First account becomes the admin.</p>
	</div>

	{#if form?.error}
		<Alert variant="destructive">
			<AlertDescription>{form.error}</AlertDescription>
		</Alert>
	{/if}

	<form method="POST" class="flex flex-col gap-4">
		<div class="flex flex-col gap-2">
			<Label for="email">Email</Label>
			<Input
				id="email"
				name="email"
				type="email"
				autocomplete="email"
				required
				value={form?.email ?? ""}
			/>
		</div>
		<div class="flex flex-col gap-2">
			<Label for="password">Password</Label>
			<Input
				id="password"
				name="password"
				type="password"
				autocomplete="new-password"
				minlength={8}
				required
			/>
			<p class="text-muted-foreground text-xs">At least 8 characters.</p>
		</div>
		<Button type="submit" class="w-full">Create account</Button>
	</form>

	<p class="text-muted-foreground text-center text-sm">
		Have an account? <a href="/login" class="text-foreground underline-offset-4 hover:underline"
			>Sign in</a
		>
	</p>
</main>
