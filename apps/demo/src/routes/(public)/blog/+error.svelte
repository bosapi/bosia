<script lang="ts">
	import type { ErrorProps } from "./$types";
	let { error }: ErrorProps = $props();
</script>

<svelte:head>
	<title>Blog error: {error.status}</title>
</svelte:head>

<div class="rounded-lg border border-red-300 bg-red-50 p-6 space-y-3 dark:bg-red-950/40">
	<p class="text-sm uppercase tracking-wide text-red-700 dark:text-red-300">Blog section error</p>
	<p class="text-3xl font-bold">{error.status}</p>
	<p class="text-base text-red-800 dark:text-red-200">{error.message}</p>
	<div class="flex gap-2 pt-2">
		<a href="/blog" class="rounded-md bg-red-700 text-white text-sm px-3 py-1.5 hover:bg-red-800">
			Back to blog
		</a>
		<a href="/" class="rounded-md border text-sm px-3 py-1.5 hover:bg-background"> Home </a>
	</div>
</div>
