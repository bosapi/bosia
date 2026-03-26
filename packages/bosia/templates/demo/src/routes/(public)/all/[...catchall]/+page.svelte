<script lang="ts">
    let { data = {} }: { data?: Record<string, any> } = $props();
    const segments = $derived(
        ((data as any)?.params?.catchall ?? "")
            .split("/")
            .filter(Boolean)
    );
</script>

<svelte:head>
    <title>Catch-all Demo | {{PROJECT_NAME}}</title>
</svelte:head>

<div class="flex flex-col items-center justify-center py-24 text-center space-y-6">
    <h1 class="text-3xl font-bold">Catch-all Route Demo</h1>
    <p class="text-muted-foreground text-sm">
        This page matches <code class="bg-muted rounded px-1 font-mono">/all/[...catchall]</code>
    </p>

    {#if segments.length > 0}
        <div class="mt-2 space-y-1">
            <p class="text-sm text-muted-foreground">Captured segments:</p>
            <div class="flex gap-2 flex-wrap justify-center">
                {#each segments as segment, i}
                    <span class="bg-muted rounded px-2 py-1 font-mono text-sm">
                        [{i}] {segment}
                    </span>
                {/each}
            </div>
        </div>
    {:else}
        <p class="text-muted-foreground text-sm italic">No segments captured</p>
    {/if}

    <a href="/" class="mt-4 rounded-md border px-4 py-2 text-sm hover:bg-muted transition-colors">
        Go Home
    </a>
</div>
