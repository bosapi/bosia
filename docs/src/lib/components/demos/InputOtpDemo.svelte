<script lang="ts">
	import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "$registry/input-otp";

	let value = $state("");
</script>

<div class="flex flex-col items-center gap-4">
	<InputOTP bind:value maxlength={6} pattern={/^\d*$/}>
		<InputOTPGroup>
			<InputOTPSlot index={0} />
			<InputOTPSlot index={1} />
			<InputOTPSlot index={2} />
		</InputOTPGroup>
		<InputOTPSeparator />
		<InputOTPGroup>
			<InputOTPSlot index={3} />
			<InputOTPSlot index={4} />
			<InputOTPSlot index={5} />
		</InputOTPGroup>
	</InputOTP>
	<p class="text-sm text-muted-foreground">
		{#if value}
			Current value: <span class="font-mono text-foreground">{value}</span>
		{:else}
			Enter your one-time password.
		{/if}
	</p>
</div>
