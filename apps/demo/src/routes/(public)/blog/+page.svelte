<script lang="ts">
    const posts = [
        {
            slug: "hello-world",
            title: "Hello, World!",
            date: "2026-03-05",
            excerpt: "The first post in the Bosbun demo — a quick intro to the framework.",
            tags: ["intro", "bosbun"],
        },
        {
            slug: "route-groups",
            title: "Route Groups Explained",
            date: "2026-03-04",
            excerpt: "How (public), (auth), (admin) groups work — invisible in URLs, share layouts.",
            tags: ["routing", "layouts"],
        },
        {
            slug: "dynamic-params",
            title: "Dynamic Params with [slug]",
            date: "2026-03-03",
            excerpt: "Using [slug] segments to match any value and pass it to server loaders.",
            tags: ["routing", "dynamic"],
        },
    ];
</script>

<svelte:head>
    <title>Blog | Bosbun Demo</title>
</svelte:head>

<div class="space-y-8">
    <div class="space-y-2">
        <h1 class="text-4xl font-bold tracking-tight">Blog</h1>
        <p class="text-muted-foreground">Routing patterns and framework internals.</p>
    </div>

    <div class="grid gap-4" data-bosbun-preload="hover">
        {#each posts as post}
            <a href="/blog/{post.slug}" class="group block rounded-lg border bg-card p-5 hover:border-primary transition-colors">
                <div class="flex items-start justify-between gap-4">
                    <div class="space-y-1">
                        <p class="font-semibold group-hover:text-primary transition-colors">{post.title}</p>
                        <p class="text-xs text-muted-foreground font-mono">{post.date}</p>
                    </div>
                    <div class="flex gap-1 shrink-0">
                        {#each post.tags as tag}
                            <span class="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">{tag}</span>
                        {/each}
                    </div>
                </div>
                <p class="mt-2 text-sm text-muted-foreground">{post.excerpt}</p>
            </a>
        {/each}
    </div>
</div>
