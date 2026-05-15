---
name: bosia-blog
description: Editorial blog — `/blog` index + `/blog/[slug]` post. Typography-led, generous whitespace, editorial theme.
triggers:
    - blog
    - article
    - editorial
    - posts
od:
    mode: page-scaffold
    category: editorial
bosia:
    design: true
    requires:
        blocks: []
        themes: [editorial]
        components: [ui/typography, ui/card, ui/separator, ui/badge]
        feats: []
    targets:
        routes:
            - "src/routes/blog/+page.svelte"
            - "src/routes/blog/[slug]/+page.svelte"
    stack: [svelte-5-runes, tailwind-v4]
---

# bosia-blog

## What it builds

- `/blog` — list page: post cards with title, excerpt, date, tag.
- `/blog/[slug]` — post page: prose article with `ui/typography` styles.

## Workflow

1. `bosia add theme/editorial ui/typography ui/card ui/separator ui/badge`.
2. Create `src/routes/blog/+page.svelte` (list).
3. Create `src/routes/blog/[slug]/+page.svelte` (post).
4. Add `+page.server.ts` for each to load posts from MD/data source.
5. Apply prose styles via `ui/typography`'s `prose` wrapper.

## Bosia conventions

- `bosia-routing` — dynamic segment `[slug]` requires `+page.svelte`. If posts load via server, add `+page.server.ts`.
- `bosia-theme-tokens` — editorial theme; prose styles use `text-foreground` / `text-muted-foreground`.
- `bosia-svelte-runes` — list rendered with `{#each}` from `data.posts`.

## Layout

- List: max-w-3xl, vertical card stack, generous padding (`py-16`).
- Post: max-w-3xl, prose container with `max-w-[70ch]`, line-height ≥ 1.6.

## Copy

- Excerpts ≤ 140 chars.
- Post date in human format ("12 May 2026"), not ISO.
- Author byline optional but consistent.

## Checklist gate

P0:

- [ ] One `<h1>` per page (list: "Blog", post: title).
- [ ] Prose max-width ≤ 70ch.
- [ ] Body line-height ≥ 1.5.
- [ ] Mobile-safe at 375px.

P1:

- [ ] Date as `<time datetime="ISO">human</time>`.
- [ ] Author byline + reading time on posts.
- [ ] Code blocks have syntax highlight + scroll on overflow.

## References

- `references/design-principles.md` — editorial typography.
- `references/checklist.md`.
- `example.svelte` — list view.
