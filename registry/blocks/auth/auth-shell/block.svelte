<script lang="ts">
	import type { Snippet } from "svelte";
	import Brand from "$lib/blocks/auth/brand/block.svelte";

	interface Props {
		/** `centered` = card on the page; `split` = brand/photo panel beside the form column. */
		variant?: "centered" | "split";
		panelTitle?: string;
		panelQuote?: string;
		panelFoot?: string;
		/** Optional photo for the split panel; falls back to a solid primary panel. */
		image?: string;
		children: Snippet;
	}

	let {
		variant = "centered",
		panelTitle = "Sign in once. Stay in flow everywhere.",
		panelQuote = "One identity across web, mobile and the CLI — secure by default.",
		panelFoot = "Trusted by teams shipping faster every day.",
		image,
		children,
	}: Props = $props();
</script>

{#if variant === "split"}
	<div class="grid min-h-screen bg-background font-body text-foreground lg:grid-cols-2">
		<div
			class="relative hidden flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex"
		>
			{#if image}
				<img src={image} alt="" class="absolute inset-0 h-full w-full object-cover" />
				<div class="absolute inset-0 bg-primary/70"></div>
			{/if}
			<div class="relative"><Brand tone="inherit" /></div>
			<div class="relative">
				<p class="max-w-[18ch] font-display text-3xl leading-tight">{panelTitle}</p>
				<p class="mt-4 max-w-[40ch] text-primary-foreground/80">{panelQuote}</p>
			</div>
			<p class="relative text-sm text-primary-foreground/70">{panelFoot}</p>
		</div>
		<div class="flex items-center justify-center p-6 sm:p-10">
			<div class="w-full max-w-[400px]">{@render children()}</div>
		</div>
	</div>
{:else}
	<div class="grid min-h-screen place-items-center bg-background p-6 font-body text-foreground">
		<div class="w-full max-w-[400px]">{@render children()}</div>
	</div>
{/if}
