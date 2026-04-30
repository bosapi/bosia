<script lang="ts">
	let { error }: { error: { status: number; message: string } } = $props();
</script>

<svelte:head>
	<title>{error.status} — {error.message}</title>
</svelte:head>

<div class="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
	<p class="text-8xl font-bold text-gray-200">{error.status}</p>
	<p class="text-2xl font-semibold text-gray-700">{error.message}</p>
	<a
		href="/"
		class="mt-4 px-5 py-2 rounded-lg bg-gray-900 text-white text-sm hover:bg-gray-700 transition-colors"
	>
		Go home
	</a>
</div>
