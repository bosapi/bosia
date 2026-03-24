import type { LoadEvent, MetadataEvent } from "bunia";

const posts: Record<string, { title: string; date: string; tags: string[]; content: string }> = {
    "hello-world": {
        title: "Hello, World!",
        date: "2026-03-05",
        tags: ["intro", "bunia"],
        content: `Welcome to Bunia! This page was loaded by a +page.server.ts file.

The slug param was extracted from the URL by the route matcher and passed to the load() function as params.slug.

This is standard SvelteKit-compatible server loading.`,
    },
    "route-groups": {
        title: "Route Groups Explained",
        date: "2026-03-04",
        tags: ["routing", "layouts"],
        content: `Route groups like (public), (auth), and (admin) are directory names that are invisible in the URL.

They let you share layouts across a set of routes without adding a URL segment. A directory named (public) applies its +layout.svelte to all routes inside it, but /public never appears in the browser URL.

This page lives at routes/(public)/blog/[slug]/+page.svelte but is served at /blog/route-groups.`,
    },
    "dynamic-params": {
        title: "Dynamic Params with [slug]",
        date: "2026-03-03",
        tags: ["routing", "dynamic"],
        content: `A directory named [slug] creates a dynamic route segment that matches any URL value.

The matched value is available as params.slug inside +page.server.ts load() and inside the page component via data.params.slug.

The route matcher uses 3-pass priority: exact matches first, then dynamic segments, then catch-all routes.`,
    },
};

export function metadata({ params }: MetadataEvent) {
    // In production this would be a DB query for the post
    const post = posts[params.slug] ?? null;
    return {
        title: post ? `${post.title} — Bunia Blog` : `Post not found`,
        description: post ? `A blog post about ${params.slug}` : undefined,
        meta: post
            ? [{ property: "og:title", content: post.title }]
            : [],
        // Pass fetched post to load() — avoids duplicate query
        data: { post },
    };
}

export async function load({ params, parent, metadata }: LoadEvent) {
    // parent() gives us data from +layout.server.ts (appName, requestTime)
    const parentData = await parent();

    // Reuse post from metadata() — no duplicate DB query
    const post = metadata?.post ?? posts[params.slug] ?? null;

    return {
        post,
        slug: params.slug,
        appName: parentData.appName as string,
    };
}
