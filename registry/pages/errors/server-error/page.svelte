<script lang="ts">
	let {
		code = "500",
		title = "Something went wrong",
		message = "An unexpected error occurred on our side. It's not you — try again in a moment.",
		homeHref = "/",
		homeLabel = "Back to home",
		retryLabel = "Try again",
	}: {
		code?: string;
		title?: string;
		message?: string;
		homeHref?: string;
		homeLabel?: string;
		retryLabel?: string;
	} = $props();
</script>

<main class="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
	<p class="font-display text-7xl font-extrabold tracking-tight text-destructive sm:text-8xl">
		{code}
	</p>
	<h1 class="mt-6 font-display text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
	<p class="mt-3 max-w-md text-muted-foreground">{message}</p>
	<div class="mt-8 flex items-center gap-3">
		<button
			type="button"
			class="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
			onclick={() => location.reload()}
		>
			{retryLabel}
		</button>
		<a
			href={homeHref}
			class="rounded-lg border border-border px-5 py-2.5 text-sm font-semibold transition hover:bg-muted"
		>
			{homeLabel}
		</a>
	</div>
</main>
