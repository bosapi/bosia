<script lang="ts">
	import { Mail, Lock } from "@lucide/svelte";
	import Brand from "$lib/blocks/auth/brand/block.svelte";
	import SocialRow from "$lib/blocks/auth/social-row/block.svelte";
	import Divider from "$lib/blocks/auth/divider/block.svelte";
	import AuthField from "$lib/blocks/auth/auth-field/block.svelte";
	import PasswordStrength from "$lib/blocks/auth/password-strength/block.svelte";
	import OtpInput from "$lib/blocks/auth/otp-input/block.svelte";
	import FormMessage from "$lib/blocks/auth/form-message/block.svelte";
</script>

<div class="mx-auto flex max-w-md flex-col gap-6 rounded-lg border border-border bg-background p-6">
	<Brand />
	<SocialRow providers={["google", "apple", "github"]} />
	<Divider label="or continue with email" />
	<AuthField
		name="demo-email"
		label="Email"
		type="email"
		icon={Mail}
		placeholder="you@company.com"
	/>
	<AuthField name="demo-pw" label="Password" type="password" icon={Lock} placeholder="••••••••" />
	<PasswordStrength value="Aa1zzzzz" />
	<OtpInput />
	<FormMessage kind="success">Account verified — you're all set.</FormMessage>
</div>
