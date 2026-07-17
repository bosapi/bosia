<script lang="ts">
	let {
		title = "We'll be right back",
		message = "We're doing some scheduled maintenance. The site will be back shortly — thanks for your patience.",
		contactEmail = "",
	}: {
		title?: string;
		message?: string;
		contactEmail?: string;
	} = $props();
</script>

<main class="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
	<span
		class="rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary"
	>
		Maintenance
	</span>
	<h1 class="mt-6 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
	<p class="mt-3 max-w-md text-muted-foreground">{message}</p>
	{#if contactEmail}
		<p class="mt-8 text-sm text-muted-foreground">
			Need something urgent?
			<a href="mailto:{contactEmail}" class="font-semibold text-primary hover:underline">
				{contactEmail}
			</a>
		</p>
	{/if}
</main>
