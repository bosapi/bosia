<script lang="ts">
	let {
		code = "404",
		title = "Page not found",
		message = "The page you're looking for doesn't exist or has moved.",
		homeHref = "/",
		homeLabel = "Back to home",
	}: {
		code?: string;
		title?: string;
		message?: string;
		homeHref?: string;
		homeLabel?: string;
	} = $props();
</script>

<main class="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
	<p class="font-display text-7xl font-extrabold tracking-tight text-primary sm:text-8xl">{code}</p>
	<h1 class="mt-6 font-display text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
	<p class="mt-3 max-w-md text-muted-foreground">{message}</p>
	<a
		href={homeHref}
		class="mt-8 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
	>
		{homeLabel}
	</a>
</main>
