<script lang="ts">
    import type { LayoutData } from './$types';
    let { data }: { data: LayoutData } = $props();
</script>

<svelte:head>
    <title>{data.appName}</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-background text-foreground">
    <div class="flex flex-1 flex-col items-center justify-center gap-8 px-4">
        <div class="text-center">
            <img src="/favicon.svg" alt="" class="mx-auto mb-6 size-16" />
            <h1 class="text-4xl font-bold tracking-tight">{data.appName}</h1>
            <p class="mt-2 text-lg text-muted-foreground">
                Fullstack app powered by Bosia + Drizzle ORM + PostgreSQL
            </p>
        </div>

        <div class="flex gap-4">
            <a
                href="/todos"
                class="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
                Todo App
            </a>
            <a
                href="/api/todos"
                target="_blank"
                class="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
                REST API
            </a>
        </div>

        <div class="mt-8 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
            <div class="rounded-lg border border-border p-4 text-center">
                <p class="text-sm font-medium">Bosia</p>
                <p class="mt-1 text-xs text-muted-foreground">Bun + Svelte 5 + Elysia</p>
            </div>
            <div class="rounded-lg border border-border p-4 text-center">
                <p class="text-sm font-medium">Drizzle ORM</p>
                <p class="mt-1 text-xs text-muted-foreground">Type-safe SQL queries</p>
            </div>
            <div class="rounded-lg border border-border p-4 text-center">
                <p class="text-sm font-medium">PostgreSQL</p>
                <p class="mt-1 text-xs text-muted-foreground">Production-ready database</p>
            </div>
        </div>
    </div>

    <footer class="border-t py-4 text-center text-sm text-muted-foreground">
        Powered by Bosia
    </footer>
</div>
