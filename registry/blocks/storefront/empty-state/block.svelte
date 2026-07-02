<script lang="ts">
	import { ShoppingBag } from "@lucide/svelte";

	interface Props {
		/** Any Lucide icon component. */
		icon?: typeof ShoppingBag;
		title?: string;
		sub?: string;
		/** Button label; pass an empty string to hide the button. */
		cta?: string;
		onCta?: () => void;
	}

	let {
		icon = ShoppingBag,
		title = "Your bag is empty",
		sub = "Looks like you haven't added anything yet.",
		cta = "Continue shopping",
		onCta,
	}: Props = $props();

	const Icon = $derived(icon);
</script>

<div class="flex flex-col items-center gap-3 py-16 text-center">
	<span class="grid h-16 w-16 place-items-center rounded-full bg-muted text-muted-foreground">
		<Icon size={28} strokeWidth={1.5} />
	</span>
	<h3 class="mt-1 font-display text-2xl tracking-tight">{title}</h3>
	{#if sub}
		<p class="max-w-[36ch] text-muted-foreground">{sub}</p>
	{/if}
	{#if cta}
		<button
			type="button"
			onclick={onCta}
			class="mt-2 inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-[15px] font-semibold text-primary-foreground transition hover:brightness-110"
		>
			{cta}
		</button>
	{/if}
</div>
