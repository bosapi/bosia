<script lang="ts">
	import { Check } from "@lucide/svelte";

	interface Props {
		eyebrow?: string;
		title?: string;
		sub?: string;
	}

	let {
		eyebrow = "Stay in the loop",
		title = "First looks, slow news, no spam",
		sub = "Join the list for new arrivals, restocks and the occasional letter from the team.",
	}: Props = $props();

	let done = $state(false);
	let email = $state("");

	function submit(e: SubmitEvent) {
		e.preventDefault();
		done = true;
	}
</script>

<section class="bg-muted/40 py-16 sm:py-20 lg:py-24">
	<div class="mx-auto flex w-full max-w-2xl flex-col items-center gap-5 px-6 text-center">
		<span class="text-xs font-semibold uppercase tracking-[0.14em] text-primary">{eyebrow}</span>
		<h2 class="font-display text-3xl tracking-tight sm:text-4xl">{title}</h2>
		<p class="text-lg text-muted-foreground">{sub}</p>

		{#if done}
			<p class="inline-flex items-center gap-2 font-semibold text-primary">
				<Check size={18} /> You're in — see you in your inbox.
			</p>
		{:else}
			<form class="flex w-full max-w-md flex-col gap-2.5 sm:flex-row" onsubmit={submit}>
				<input
					type="email"
					required
					bind:value={email}
					placeholder="you@example.com"
					aria-label="Email"
					class="flex-1 rounded-lg border border-border bg-card px-3.5 py-3 text-[15px] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
				/>
				<button
					type="submit"
					class="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-[15px] font-semibold text-primary-foreground transition hover:brightness-110"
					>Subscribe</button
				>
			</form>
		{/if}
		<p class="text-sm text-muted-foreground/70">By subscribing you agree to our privacy policy.</p>
	</div>
</section>
