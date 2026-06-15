<script lang="ts">
	import { Mail, Lock, User, ArrowRight } from "@lucide/svelte";
	import AuthShell from "$lib/blocks/auth/auth-shell/block.svelte";
	import AuthCard from "$lib/blocks/auth/auth-card/block.svelte";
	import SocialRow from "$lib/blocks/auth/social-row/block.svelte";
	import Divider from "$lib/blocks/auth/divider/block.svelte";
	import AuthField from "$lib/blocks/auth/auth-field/block.svelte";
	import PasswordStrength from "$lib/blocks/auth/password-strength/block.svelte";

	// `variant` defaults to the centered card; pass "split" for the two-panel layout.
	// See the bosia-login skill.
	let { variant = "centered" }: { variant?: "centered" | "split" } = $props();
</script>

<AuthShell {variant}>
	<AuthCard title="Create your account" lede="Start free. No credit card required.">
		<div class="flex flex-col gap-5">
			<SocialRow grid />
			<Divider />
			<AuthField name="name" label="Full name" icon={User} placeholder="Ada Lovelace" />
			<AuthField
				name="email"
				label="Work email"
				type="email"
				icon={Mail}
				placeholder="you@company.com"
			/>
			<div class="flex flex-col gap-2">
				<AuthField
					name="password"
					label="Password"
					type="password"
					icon={Lock}
					placeholder="Create a password"
					helper="8+ characters, with a number"
				/>
				<PasswordStrength />
			</div>
			<button
				type="button"
				class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
			>
				Create account
				<ArrowRight size={18} />
			</button>
			<p class="text-center text-xs text-muted-foreground">
				By continuing you agree to our
				<a href="##" class="text-primary hover:underline">Terms</a> and
				<a href="##" class="text-primary hover:underline">Privacy Policy</a>.
			</p>
		</div>
		{#snippet footer()}
			Already have an account?
			<a href="##" class="font-semibold text-primary hover:underline">Sign in</a>
		{/snippet}
	</AuthCard>
</AuthShell>
