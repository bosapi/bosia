<script lang="ts">
	import { Check } from "@lucide/svelte";

	interface Props {
		title?: string;
		body?: string;
		cta?: string;
		orderNumber?: string;
		onContinue?: () => void;
	}

	let {
		title = "Order confirmed",
		body = "Thank you. A confirmation is on its way to your inbox, and we'll let you know the moment your order ships.",
		cta = "Continue shopping",
		orderNumber = "MRC-10428",
		onContinue,
	}: Props = $props();
</script>

<section class="bg-background py-24">
	<div class="mx-auto flex w-full max-w-xl flex-col items-center px-6 text-center">
		<span class="mb-6 grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
			<Check size={32} />
		</span>
		<h1 class="font-display text-4xl tracking-tight sm:text-5xl">{title}</h1>
		{#if orderNumber}
			<p class="mt-3 text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
				Order {orderNumber}
			</p>
		{/if}
		<p class="mt-4 text-lg text-muted-foreground">{body}</p>
		<button
			type="button"
			onclick={onContinue}
			class="mt-7 inline-flex items-center justify-center rounded-lg bg-primary px-7 py-4 text-base font-semibold text-primary-foreground transition hover:brightness-110"
			>{cta}</button
		>
	</div>
</section>
