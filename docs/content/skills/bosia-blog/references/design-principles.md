# Blog — editorial principles

## Lineage

- open-design `skills/frontend-design` — typographic-first discipline.
- open-design `editorial-burgundy-principles-template`, `field-notes-editorial-template` — editorial layout reference.

## Rules

- **Measure** — body line length 60–80 characters. `max-w-[70ch]` is the practical cap.
- **Leading** — body 1.5–1.7. Headings tighter (1.1–1.2).
- **Type pairing** — display serif headings + sans body works; the reverse rarely does. The editorial theme picks for you.
- **Whitespace** — generous top/bottom margins on headings (`mt-12 mb-4` for h2). Don't crowd.
- **No center alignment on body** — flush-left for legibility.

## Post page anatomy

1. Title (h1) + meta (date, tag, author).
2. Prose body — `prose` container from `ui/typography`.
3. Footer — author bio (optional), share, related posts.

## Common failures

- Body text full-width on desktop (unreadable).
- Date in ISO (`2026-05-12`) instead of human (`12 May 2026`).
- Code blocks without horizontal scroll → page overflows on mobile.
