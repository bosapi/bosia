---
name: bosia-image-external
description: Fetch real keyword-matched stock photos via the image_external_search tool, with cross-app DB cache to preserve provider quota.
triggers:
    - image
    - photo
    - stock image
    - unsplash
    - pexels
    - pixabay
    - hero image
    - product image
    - gallery
    - real photo
    - cover image
od:
    mode: convention
    category: framework
bosia:
    design: true
    requires:
        blocks: []
        themes: []
        components: []
        feats: []
    targets:
        routes: []
    stack: [svelte-runes]
---

# bosia-image-external

## What it covers

- Calling the `image_external_search` tool to get real keyword-matched stock photos.
- Wiring returned URLs straight into markup (`<img src>`, `style="background-image:url(...)"`, etc.).
- Surfacing the required photographer attribution.
- Knowing when the tool hits the DB cache vs the upstream provider.

## When to use

- The brief calls for real photos (hero shot, product image, gallery, blog cover, lifestyle photo).
- A page would otherwise embed a random `picsum`/`unsplash.com` URL that doesn't match the app's domain (e.g. a generic photo on a book store hero).

## When NOT to use

- Skeletons, avatars, empty states → keep `placehold.co`.
- Pure illustration/abstract texture with no thematic meaning → `picsum.photos/seed/<seed>/<w>/<h>`.
- The user uploads their own image → use [[bosia-file-upload]] instead.

## Rules

### R1 — One call per logical image set

```ts
image_external_search({
	keyword: "book", // simple, lowercase, singular
	count: 6, // how many you need on the page
	orientation: "landscape", // optional: landscape | portrait | square
});
```

Use a single keyword close to the brief's domain ("book", "coffee", "running shoes"). Long phrases ("rare antique leather-bound book") tend to underperform on all three providers.

### R2 — Cache is shared across apps

The tool checks the bosapi DB before calling the upstream provider. Two apps asking for `"book"` share the same cached rows — the second app gets `source: "cache"` and burns no provider quota. If the cache is short of `count`, the tool tops up from the provider and stores the new rows under the same keyword.

### R3 — Attribution is mandatory for Unsplash & Pexels

Each returned image has `author` and `authorUrl`. Surface them somewhere visible:

```svelte
<img src={img.url} alt={img.alt ?? `Photo by ${img.author}`} />
{#if img.author}
	<p class="text-xs text-muted-foreground">
		Photo by <a href={img.authorUrl} target="_blank" rel="noopener">{img.author}</a>
	</p>
{/if}
```

Caption can live in a tooltip, figcaption, or alt text — pick what fits the layout, but don't drop the credit entirely.

### R4 — Fallback chain

If `image_external_search` returns `ok: false` (no provider configured) or `images: []` (provider returned nothing), fall back to `https://picsum.photos/seed/<keyword>/<w>/<h>` so the page still renders. Never invent a local file path.

### R5 — Provider selection

Pass `provider: "auto"` (default) unless the user explicitly asks for a specific source. `auto` tries Unsplash → Pexels → Pixabay and skips any provider whose API key isn't configured on the host.

## Return shape

```ts
{
  ok: true,
  source: "cache" | "fresh" | "mixed",
  images: Array<{
    id: string;           // image_cache row id
    provider: "unsplash" | "pexels" | "pixabay";
    url: string;          // direct CDN URL — embed directly
    width: number;
    height: number;
    alt: string | null;
    author: string | null;
    authorUrl: string | null;
  }>;
}
```

`source` is informational — useful when debugging quota: `cache` means no upstream call was made.
