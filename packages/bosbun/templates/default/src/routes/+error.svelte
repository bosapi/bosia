<script lang="ts">
    let { data }: { data: { status: number; message: string } } = $props();
</script>

<svelte:head>
    <title>{data.status} — {data.message}</title>
</svelte:head>

<main class="flex min-h-screen flex-col items-center justify-center gap-4 text-center px-4">
    <p class="text-8xl font-bold text-gray-200">{data.status}</p>
    <p class="text-2xl font-semibold">{data.message}</p>
    <a
        href="/"
        class="mt-4 rounded-md border px-4 py-2 text-sm hover:bg-muted transition-colors"
    >
        Go home
    </a>
</main>
