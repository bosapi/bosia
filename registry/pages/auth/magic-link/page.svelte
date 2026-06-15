<script lang="ts">
	import { Mail } from "@lucide/svelte";
	import AuthShell from "$lib/blocks/auth/auth-shell/block.svelte";
	import AuthCard from "$lib/blocks/auth/auth-card/block.svelte";
	import FormMessage from "$lib/blocks/auth/form-message/block.svelte";

	// `variant` defaults to the centered card; pass "split" for the two-panel layout.
	// See the bosia-login skill.
	let { variant = "centered" }: { variant?: "centered" | "split" } = $props();
</script>

<AuthShell {variant}>
	<AuthCard center brand={false} icon={Mail} title="Magic link sent">
		<div class="flex flex-col gap-5 text-center">
			<p class="text-sm text-muted-foreground">
				We sent a sign-in link to
				<span class="font-semibold text-foreground">you@company.com</span>. It expires in 15
				minutes.
			</p>
			<FormMessage kind="success">Check your inbox — the link signs you in instantly.</FormMessage>
			<button
				type="button"
				class="inline-flex w-full items-center justify-center rounded-lg border border-input bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-secondary"
			>
				Back to sign in
			</button>
			<p class="text-sm text-muted-foreground">
				Didn't get it? <a href="##" class="font-semibold text-primary hover:underline">Resend</a>
			</p>
		</div>
	</AuthCard>
</AuthShell>
