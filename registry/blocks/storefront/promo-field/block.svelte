<script lang="ts">
	import { Check } from "@lucide/svelte";

	interface Props {
		placeholder?: string;
		/** Codes that count as valid, case-insensitive. */
		validCodes?: string[];
	}

	let { placeholder = "Promo code", validCodes = ["WELCOME10", "MERCATO"] }: Props = $props();

	let code = $state("");
	let applied = $state<string | null>(null);
	let error = $state(false);

	function apply() {
		const normalized = code.trim().toUpperCase();
		if (normalized && validCodes.includes(normalized)) {
			applied = normalized;
			error = false;
		} else {
			error = true;
			applied = null;
		}
	}
</script>

<div>
	<div class="flex">
		<input
			bind:value={code}
			{placeholder}
			aria-label="Promo code"
			class="flex-1 rounded-l-lg border border-border bg-card px-3.5 py-3 text-[15px] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
		/>
		<button
			type="button"
			onclick={apply}
			class="rounded-r-lg bg-foreground px-5 text-[15px] font-semibold text-background transition hover:brightness-110"
			>Apply</button
		>
	</div>
	{#if applied}
		<p class="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
			<Check size={15} /> Code {applied} applied
		</p>
	{:else if error}
		<p class="mt-2 text-sm text-destructive">That code isn't valid.</p>
	{/if}
</div>
