<script lang="ts">
	let { error }: { error: { status: number; message: string } } = $props();
</script>

<svelte:head>
	<title>{error.status} — {error.message}</title>
</svelte:head>

<main class="flex min-h-screen flex-col items-center justify-center gap-4 text-center px-4">
	<p class="text-8xl font-bold text-gray-200">{error.status}</p>
	<p class="text-2xl font-semibold">{error.message}</p>
	<a href="/" class="mt-4 rounded-md border px-4 py-2 text-sm hover:bg-muted transition-colors">
		Go home
	</a>
</main>
