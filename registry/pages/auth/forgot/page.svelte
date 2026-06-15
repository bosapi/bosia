<script lang="ts">
	import { Mail } from "@lucide/svelte";
	import AuthShell from "$lib/blocks/auth/auth-shell/block.svelte";
	import AuthCard from "$lib/blocks/auth/auth-card/block.svelte";
	import AuthField from "$lib/blocks/auth/auth-field/block.svelte";
	import FormMessage from "$lib/blocks/auth/form-message/block.svelte";

	// `variant` defaults to the centered card; pass "split" for the two-panel layout.
	// See the bosia-login skill.
	let { variant = "centered" }: { variant?: "centered" | "split" } = $props();
</script>

<AuthShell {variant}>
	<AuthCard
		eyebrow="Account recovery"
		title="Reset your password"
		lede="Enter your email and we'll send a reset link."
	>
		<div class="flex flex-col gap-5">
			<AuthField
				name="email"
				label="Email"
				type="email"
				icon={Mail}
				placeholder="you@company.com"
			/>
			<FormMessage kind="info"
				>We'll only send a secure, single-use link that expires soon.</FormMessage
			>
			<button
				type="button"
				class="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
			>
				Send reset link
			</button>
		</div>
		{#snippet footer()}
			Remembered it?
			<a href="##" class="font-semibold text-primary hover:underline">Back to sign in</a>
		{/snippet}
	</AuthCard>
</AuthShell>
