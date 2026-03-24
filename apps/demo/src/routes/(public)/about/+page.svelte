<svelte:head>
    <title>About | Bosbun Demo</title>
</svelte:head>

<div class="space-y-6 max-w-2xl">
    <h1 class="text-4xl font-bold tracking-tight">About Bosbun</h1>
    <p class="text-muted-foreground text-lg">
        A minimalist fullstack framework built on Bun, ElysiaJS, and Svelte 5.
    </p>

    <ul class="space-y-2 text-foreground">
        {#each [
            "Bun runtime — fast builds, native TypeScript",
            "ElysiaJS — HTTP server with type-safe routing",
            "Svelte 5 Runes — fine-grained reactivity",
            "Isomorphic SSR with client hydration",
            "File-based routing (SvelteKit-compatible conventions)",
            "Nested layouts and route groups (public), (auth), (admin)",
            "Dynamic params [slug] and catch-all [...rest]",
            "Server loaders with parent() data threading",
            "Hooks — sequence() middleware for auth, logging, etc.",
            "Component registry — bosbun add button",
            "Feature registry — bosbun feat login",
        ] as item}
            <li class="flex items-start gap-2">
                <span class="text-primary mt-0.5">✓</span>
                <span>{item}</span>
            </li>
        {/each}
    </ul>
</div>
