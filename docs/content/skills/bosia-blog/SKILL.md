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
    blocks: [blog/post-list, blog/post-header, blog/post-body, blog/related]
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

1. **Read `BRIEF.md § Aesthetic`.** Apply the locked `Direction` to typography rhythm and post-page layout (e.g. editorial → drop caps + pull quotes + asymmetric image crops, brutalist → mono everywhere + visible grid lines, organic → hand-drawn dividers between sections). The blog is text-heavy, so the type pair from § Aesthetic does the heavy lifting — verify display + body fonts are wired in `app.css @theme` before drafting prose styles. Place the named `Memorable detail` on the post page (e.g. scroll-driven reading progress bar) or the list page (e.g. hand-set pull quote from the latest post).
2. `bosia add theme/editorial ui/typography ui/card ui/separator ui/badge`.
3. `bosia add block blog/post-list blog/post-header blog/post-body blog/related` — the registry
   blocks for list cards, post header, prose body and related row. Restyle them to the locked
   direction instead of building from scratch.
4. Create `src/routes/blog/+page.svelte` (list) composing `blog/post-list`.
5. Create `src/routes/blog/[slug]/+page.svelte` (post) composing `blog/post-header` +
   `blog/post-body` + `blog/related`.
6. Add `+page.server.ts` for each to load posts from MD/data source — or install the `blog`
   feature (`bosia feat blog`) for a Drizzle-backed posts table, loaders and seed.
7. Apply prose styles via `blog/post-body` (wraps `ui/typography`).

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
- [ ] BRIEF.md § Aesthetic direction applied to prose rhythm and post layout; memorable detail present on either list or post page.

P1:

- [ ] Date as `<time datetime="ISO">human</time>`.
- [ ] Author byline + reading time on posts.
- [ ] Code blocks have syntax highlight + scroll on overflow.

## References

- `references/design-principles.md` — editorial typography.
- `references/checklist.md`.
- `example.svelte` — list view.
