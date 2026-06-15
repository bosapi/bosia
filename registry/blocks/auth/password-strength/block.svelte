<script lang="ts">
	let { value = "" }: { value?: string } = $props();

	// Ported from the design system's strengthOf(): length, mixed case, digit/symbol.
	const score = $derived.by(() => {
		if (!value) return 0;
		let s = 0;
		if (value.length >= 8) s++;
		if (/[A-Z]/.test(value) && /[a-z]/.test(value)) s++;
		if (/\d/.test(value) || /[^A-Za-z0-9]/.test(value)) s++;
		return Math.min(s, 3);
	});

	const labels = ["", "Weak", "Getting there", "Strong"];
	// Status colours (not the brand): weak → destructive, mid → amber, strong → emerald.
	const fills = ["", "bg-destructive", "bg-amber-500", "bg-emerald-500"];
</script>

<div>
	<div class="flex gap-1.5">
		{#each [1, 2, 3] as n (n)}
			<span
				class="h-1.5 flex-1 rounded-full transition-colors {score >= n
					? fills[score]
					: 'bg-border'}"
			></span>
		{/each}
	</div>
	{#if value}
		<span class="mt-1.5 block text-xs text-muted-foreground">{labels[score]}</span>
	{/if}
</div>
