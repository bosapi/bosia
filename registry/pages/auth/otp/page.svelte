<script lang="ts">
	import { Shield } from "@lucide/svelte";
	import AuthShell from "$lib/blocks/auth/auth-shell/block.svelte";
	import AuthCard from "$lib/blocks/auth/auth-card/block.svelte";
	import OtpInput from "$lib/blocks/auth/otp-input/block.svelte";
	import FormMessage from "$lib/blocks/auth/form-message/block.svelte";

	// Swap to "split" for the two-panel layout — see the bosia-login skill.
	const variant = "centered";
</script>

<AuthShell {variant}>
	<AuthCard
		center
		brand={false}
		icon={Shield}
		title="Two-factor check"
		lede="Enter the 6-digit code we sent to your device."
	>
		<div class="flex flex-col gap-5">
			<OtpInput />
			<FormMessage kind="info">For your security, this code expires in 10 minutes.</FormMessage>
			<button
				type="button"
				class="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
			>
				Verify code
			</button>
		</div>
		{#snippet footer()}
			Didn't receive a code?
			<a href="##" class="font-semibold text-primary hover:underline">Resend</a>
		{/snippet}
	</AuthCard>
</AuthShell>
