---
name: bosia-docs-site
description: 3-column docs — left sidebar nav, center content (prose), right TOC. Sticky columns. Code blocks with copy. Search command palette.
triggers:
  - docs site
  - documentation
  - 3-column docs
  - reference site
od:
  mode: page-scaffold
  category: docs
bosia:
  design: true
  requires:
    blocks: []
    themes: [neutral]
    components:
      [ui/sidebar, ui/typography, ui/separator, ui/command, ui/button, ui/scroll-area, ui/kbd]
    feats: []
  targets:
    routes:
      - "src/routes/docs/+layout.svelte"
      - "src/routes/docs/[...slug]/+page.svelte"
  stack: [svelte-5-runes, tailwind-v4]
---

# bosia-docs-site

## What it builds

A docs surface under `/docs`:

- `+layout.svelte` — 3-column shell (sidebar / content / TOC).
- `[...slug]/+page.svelte` — content page that renders MD/MDX.
- Command-palette search (`ui/command`).
- Sticky sidebar + TOC; content scrolls.

## Workflow

1. `bosia add ui/sidebar ui/typography ui/separator ui/command ui/button ui/scroll-area ui/kbd`.
2. Create `src/routes/docs/+layout.svelte` with the 3-column grid.
3. Create `src/routes/docs/+layout.server.ts` to load nav tree.
4. Create `src/routes/docs/[...slug]/+page.svelte` for content.
5. Wire command palette to a search index (build-time or client-side).

## Rules

### Layout

- Desktop ≥ `lg`: 3 columns — sidebar (`240px`), main (`flex-1`, max-w prose), TOC (`200px`).
- Tablet/mobile: sidebar collapses to a `ui/sheet`; TOC moves to top of page or hides.
- Header bar above with brand + search trigger.

### Prose

- `max-w-[70ch]` on content.
- `ui/typography` `prose` wrapper.
- Code blocks: horizontal scroll on overflow, copy button, syntax theme that tracks the active theme.

### Sidebar

- Sections with subsection collapse.
- Active item highlighted (`bg-accent text-accent-foreground`).
- Scrollable independently of main.

### TOC

- Generated from h2/h3 of the current page.
- Active heading tracked via `IntersectionObserver`.

### Search

- Cmd+K opens `ui/command` palette.
- Show keyboard hint via `ui/kbd`.

## Bosia conventions

- `bosia-routing` — `[...slug]` catch-all needs `+page.svelte`; layout server loader fetches nav once.
- `bosia-theme-tokens` — neutral theme; code blocks use semantic tokens for chrome.
- `bosia-svelte-runes` — `$state` for sidebar open, search query; `$effect` for IntersectionObserver.

## Checklist gate

P0:

- [ ] Sidebar collapses to sheet on mobile.
- [ ] Active sidebar item visible.
- [ ] Prose width capped at 70ch.
- [ ] Code blocks scroll horizontally (don't overflow viewport).
- [ ] Cmd+K opens search.

P1:

- [ ] TOC tracks scroll via IntersectionObserver.
- [ ] Sidebar + TOC scroll independently of content.
- [ ] Heading anchors visible on hover, copyable.
- [ ] Search results show breadcrumb path.

## References

- `references/design-principles.md`.
- `references/checklist.md`.
- `example.svelte` — layout shell.
