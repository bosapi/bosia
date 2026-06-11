<!-- EDIT THIS FILE: tweak copy, branding, social-auth providers, etc. -->
<script lang="ts">
	import type { ActionData } from "./$types";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import { Button } from "$lib/components/ui/button";
	import { Alert, AlertDescription } from "$lib/components/ui/alert";

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
	<title>Sign in</title>
	<meta name="description" content="Sign in to your account." />
</svelte:head>

<main class="mx-auto flex min-h-[80vh] w-full max-w-sm flex-col justify-center gap-6 px-4 py-12">
	<div class="flex flex-col gap-1 text-center">
		<h1 class="text-2xl font-semibold tracking-tight">Sign in</h1>
		<p class="text-muted-foreground text-sm">Welcome back. Use your email and password.</p>
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
				autocomplete="current-password"
				required
			/>
		</div>
		<Button type="submit" class="w-full">Sign in</Button>
	</form>

	<p class="text-muted-foreground text-center text-sm">
		No account? <a href="/register" class="text-foreground underline-offset-4 hover:underline"
			>Create one</a
		>
	</p>
</main>
