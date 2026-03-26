<script lang="ts">
    const name = "{{PROJECT_NAME}}";
</script>

<main class="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
    <div class="flex flex-col items-center gap-3 text-center">
        <img src="/favicon.svg" alt="" class="size-16" />
        <h1 class="text-4xl font-bold tracking-tight">{name}</h1>
        <p class="text-muted-foreground text-lg">
            A Bosia project — SSR + Svelte 5 + Bun + ElysiaJS
        </p>
    </div>

    <div class="mt-4 flex gap-3">
        <a
            href="https://github.com/bosapi/bosia"
            target="_blank"
            rel="noopener noreferrer"
            class="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium transition-colors"
        >
            Docs
        </a>
        <a
            href="https://github.com/bosapi/bosia/tree/main/registry"
            target="_blank"
            rel="noopener noreferrer"
            class="border-border bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md border px-4 py-2 text-sm font-medium transition-colors"
        >
            Components
        </a>
    </div>

    <p class="text-muted-foreground mt-6 text-sm">
        Edit <code class="bg-muted rounded px-1 py-0.5 font-mono text-xs">src/routes/+page.svelte</code> to get started
    </p>
</main>
