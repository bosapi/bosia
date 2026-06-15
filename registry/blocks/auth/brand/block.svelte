<script lang="ts">
	interface Props {
		/** Wordmark text shown next to the logomark. */
		name?: string;
		/** `brand` paints a primary tile; `inherit` adapts to a coloured panel via currentColor. */
		tone?: "brand" | "inherit";
	}

	let { name = "Bosia", tone = "brand" }: Props = $props();
</script>

<span class="inline-flex items-center gap-2.5">
	<span
		class="grid h-9 w-9 place-items-center rounded-lg {tone === 'inherit'
			? 'bg-primary-foreground/15 text-current'
			: 'bg-primary text-primary-foreground'}"
		aria-hidden="true"
	>
		<svg viewBox="0 0 40 40" width="22" height="22" fill="none">
			<circle cx="20" cy="17" r="5.2" fill="none" stroke="currentColor" stroke-width="3.2" />
			<path d="M20 21 L20 30" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" />
		</svg>
	</span>
	<span
		class="font-display text-lg font-bold tracking-tight {tone === 'inherit'
			? 'text-current'
			: 'text-foreground'}">{name}</span
	>
</span>
