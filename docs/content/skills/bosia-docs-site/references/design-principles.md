# Docs site — principles

## Lineage

- open-design `skills/frontend-design` — 3-column reading layout.
- open-design `skills/ui-skills` — sidebar + scroll-area + command-palette composition.

## Why 3 columns

- **Left:** "where am I" (sidebar nav).
- **Center:** "the content".
- **Right:** "what's on this page" (TOC).

The reader's eye stays in the center; the columns are stable references. Sticky behavior preserves the orientation across scroll.

## Mobile collapse

The 3-column shape is desktop-only. On tablet, drop the TOC. On mobile, hide the sidebar in a sheet triggered from the header.

## Prose width

70ch is the cap. Beyond that, the eye gets tired tracking from end of line to start of next. Reference docs trend longer than blog prose — 65ch is also fine.

## Search

Search is a docs feature, not a luxury. Cmd+K is the de facto shortcut; expose it visibly in the header.

## Code-block discipline

- Horizontal scroll on overflow — never wrap.
- Copy button on hover (or always on touch).
- Syntax theme tracks the active theme (light/dark).
- Inline code (`backticks`) uses subtle background to distinguish from prose.
