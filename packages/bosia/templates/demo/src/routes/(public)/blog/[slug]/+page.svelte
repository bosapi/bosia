<script lang="ts">
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();

    const post = $derived(data.post);
    const slug = $derived(data.slug ?? data.params.slug ?? "");
</script>

<svelte:head>
    <title>{post ? post.title : "Post Not Found"} | {{PROJECT_NAME}}</title>
</svelte:head>

{#if post}
    <article class="space-y-6 max-w-2xl">
        <a href="/blog" class="text-sm text-muted-foreground hover:text-foreground transition-colors">← Blog</a>

        <div class="space-y-2">
            <div class="flex flex-wrap gap-1">
                {#each post.tags as tag}
                    <span class="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">{tag}</span>
                {/each}
            </div>
            <h1 class="text-4xl font-bold tracking-tight">{post.title}</h1>
            <p class="text-sm text-muted-foreground font-mono">{post.date}</p>
        </div>

        <hr class="border-border" />

        <div class="space-y-4">
            {#each post.content.split("\n\n") as paragraph}
                <p class="text-foreground leading-relaxed">{paragraph}</p>
            {/each}
        </div>

        <hr class="border-border" />

        <!-- Route debug box — demonstrates params flowing from server to client -->
        <div class="rounded-lg border bg-muted/40 p-4 space-y-1 text-sm font-mono">
            <p class="font-sans text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Route debug</p>
            <p><span class="text-muted-foreground">pattern: </span>/blog/[slug]</p>
            <p><span class="text-muted-foreground">params.slug: </span><span class="text-primary font-semibold">{slug}</span></p>
            <p><span class="text-muted-foreground">loaded by: </span>+page.server.ts</p>
            <p><span class="text-muted-foreground">parent data: </span>{data.appName}</p>
        </div>
    </article>
{:else}
    <div class="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <p class="text-7xl font-bold text-destructive">404</p>
        <p class="text-xl text-muted-foreground">Post "<span class="font-mono">{slug}</span>" not found.</p>
        <a href="/blog" class="rounded-md border px-4 py-2 text-sm hover:bg-muted transition-colors">Back to Blog</a>
    </div>
{/if}
