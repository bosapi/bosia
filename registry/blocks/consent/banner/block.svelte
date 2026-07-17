<script lang="ts">
	import { onMount } from "svelte";

	let {
		storageKey = "cookie-consent",
		message = "We use cookies to understand how the site is used and to improve it. You can decline and everything still works.",
		policyHref = "/privacy",
		policyLabel = "Privacy policy",
		acceptLabel = "Accept",
		declineLabel = "Decline",
		onDecision,
	}: {
		storageKey?: string;
		message?: string;
		policyHref?: string;
		policyLabel?: string;
		acceptLabel?: string;
		declineLabel?: string;
		onDecision?: (accepted: boolean) => void;
	} = $props();

	// hidden until mount so SSR output never flashes the banner for returning visitors
	let visible = $state(false);

	onMount(() => {
		visible = localStorage.getItem(storageKey) === null;
	});

	function decide(accepted: boolean) {
		localStorage.setItem(storageKey, accepted ? "accepted" : "declined");
		visible = false;
		onDecision?.(accepted);
	}
</script>

{#if visible}
	<div
		role="region"
		aria-label="Cookie consent"
		class="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card p-4 text-card-foreground shadow-lg sm:p-5"
	>
		<div class="mx-auto flex w-full max-w-6xl flex-col gap-4 sm:flex-row sm:items-center">
			<p class="flex-1 text-sm text-muted-foreground">
				{message}
				<a href={policyHref} class="font-semibold text-primary hover:underline">{policyLabel}</a>
			</p>
			<div class="flex shrink-0 items-center gap-3">
				<button
					type="button"
					onclick={() => decide(false)}
					class="rounded-lg border border-border px-4 py-2 text-sm font-semibold transition hover:bg-muted"
				>
					{declineLabel}
				</button>
				<button
					type="button"
					onclick={() => decide(true)}
					class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
				>
					{acceptLabel}
				</button>
			</div>
		</div>
	</div>
{/if}
