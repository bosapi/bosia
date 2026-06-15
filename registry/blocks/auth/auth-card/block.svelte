<script lang="ts">
	import type { Snippet } from "svelte";
	import type { LucideIcon } from "@lucide/svelte";
	import Brand from "$lib/blocks/auth/brand/block.svelte";

	interface Props {
		title?: string;
		lede?: string;
		/** Tracked-uppercase eyebrow above the title. */
		eyebrow?: string;
		/** Show the brand mark at the top of the card. */
		brand?: boolean;
		/** Centre the header (and badge icon) — used by the sent / OTP screens. */
		center?: boolean;
		/** Optional lucide icon rendered as a soft badge above the title. */
		icon?: LucideIcon;
		children: Snippet;
		/** Optional "switch line" footer (e.g. "New here? Create an account"). */
		footer?: Snippet;
	}

	let {
		title,
		lede,
		eyebrow,
		brand = true,
		center = false,
		icon,
		children,
		footer,
	}: Props = $props();

	const Icon = $derived(icon);
</script>

<div
	class="w-full rounded-2xl border border-border bg-card p-7 text-card-foreground shadow-lg sm:p-9"
>
	<div class={center ? "text-center" : ""}>
		{#if brand}
			<div class="mb-6 {center ? 'flex justify-center' : ''}"><Brand /></div>
		{/if}
		{#if Icon}
			<div
				class="mb-5 grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary {center
					? 'mx-auto'
					: ''}"
			>
				<Icon size={26} />
			</div>
		{/if}
		{#if eyebrow}
			<span class="text-xs font-semibold uppercase tracking-[0.14em] text-primary">{eyebrow}</span>
		{/if}
		{#if title}
			<h1 class="font-display text-3xl font-extrabold tracking-tight {eyebrow ? 'mt-2' : ''}">
				{title}
			</h1>
		{/if}
		{#if lede}
			<p class="mt-2 text-[15px] text-muted-foreground">{lede}</p>
		{/if}
	</div>

	<div class="mt-6">{@render children()}</div>

	{#if footer}
		<div class="mt-6 text-center text-sm text-muted-foreground">{@render footer()}</div>
	{/if}
</div>
