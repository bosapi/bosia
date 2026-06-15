<script lang="ts">
	import { Mail, Lock } from "@lucide/svelte";
	import AuthShell from "$lib/blocks/auth/auth-shell/block.svelte";
	import AuthCard from "$lib/blocks/auth/auth-card/block.svelte";
	import SocialRow from "$lib/blocks/auth/social-row/block.svelte";
	import Divider from "$lib/blocks/auth/divider/block.svelte";
	import AuthField from "$lib/blocks/auth/auth-field/block.svelte";

	// `variant` defaults to the centered card; pass "split" for the two-panel layout.
	// See the bosia-login skill.
	let { variant = "centered" }: { variant?: "centered" | "split" } = $props();
</script>

<AuthShell {variant}>
	<AuthCard title="Welcome back" lede="Sign in to pick up where you left off.">
		<div class="flex flex-col gap-5">
			<SocialRow />
			<Divider label="or sign in with email" />
			<AuthField
				name="email"
				label="Email"
				type="email"
				icon={Mail}
				placeholder="you@company.com"
			/>
			<div class="flex flex-col gap-1.5">
				<div class="flex items-center justify-between">
					<label for="password" class="text-[13px] font-semibold text-foreground">Password</label>
					<a href="##" class="text-[13px] font-semibold text-primary hover:underline">Forgot?</a>
				</div>
				<AuthField name="password" type="password" icon={Lock} placeholder="••••••••" />
			</div>
			<label class="flex items-center gap-2.5 text-sm text-muted-foreground">
				<input type="checkbox" checked class="h-4 w-4 rounded border-input accent-primary" />
				Remember me
			</label>
			<button
				type="button"
				class="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
			>
				Sign in
			</button>
		</div>
		{#snippet footer()}
			New here? <a href="##" class="font-semibold text-primary hover:underline">Create an account</a
			>
		{/snippet}
	</AuthCard>
</AuthShell>
