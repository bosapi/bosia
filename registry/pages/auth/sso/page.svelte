<script lang="ts">
	import { Building2, ArrowRight } from "@lucide/svelte";
	import AuthShell from "$lib/blocks/auth/auth-shell/block.svelte";
	import AuthCard from "$lib/blocks/auth/auth-card/block.svelte";
	import AuthField from "$lib/blocks/auth/auth-field/block.svelte";

	// `variant` defaults to the centered card; pass "split" for the two-panel layout.
	// See the bosia-login skill.
	let { variant = "centered" }: { variant?: "centered" | "split" } = $props();
</script>

<AuthShell {variant}>
	<AuthCard
		brand={false}
		icon={Building2}
		eyebrow="Enterprise"
		title="Sign in with SSO"
		lede="Use your organization's single sign-on. Enter your work email or domain."
	>
		<div class="flex flex-col gap-5">
			<AuthField
				name="sso"
				label="Work email or domain"
				icon={Building2}
				placeholder="you@company.com"
			/>
			<button
				type="button"
				class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
			>
				Continue with SSO
				<ArrowRight size={18} />
			</button>
		</div>
		{#snippet footer()}
			<a href="##" class="font-semibold text-primary hover:underline">Use another method</a>
		{/snippet}
	</AuthCard>
</AuthShell>
