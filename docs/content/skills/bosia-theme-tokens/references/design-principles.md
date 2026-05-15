# Design principles — semantic tokens

## Lineage

Drawn from open-design upstreams:

- `skills/frontend-design` — production UI discipline: typography, spacing, color roles.
- `skills/ui-skills` — semantic color tokens, theme-swap-without-rewrite pattern.

shadcn/ui (the upstream of our registry primitives) standardized this token vocabulary; Bosia adopts it 1:1.

## Why semantic tokens

A token like `bg-card` answers a **role question** ("what is this surface?") instead of a **render question** ("what color is this?"). The role is stable across themes; the color is not. Components written against roles survive a re-skin without edits.

Concretely:

- **Theme swap is a CSS-vars change**, not a component change. `tokens.css` defines `--card`, `--primary`, … in HSL. Switching themes = swapping one file.
- **Dark mode is automatic** — the same token classes resolve to different values via `:root.dark`. Hardcoded `dark:bg-zinc-900` defeats this.
- **Contrast pairings are guaranteed** — `text-card-foreground` is always legible on `bg-card`. Raw color pairs like `text-zinc-900` on `bg-card` may fail in a darker theme.

## What this skill enforces

1. **Vocabulary** — only the role-named classes listed in `SKILL.md`.
2. **One theme installed** — the registry's `theme/*` entry is the source of token values; do not redefine vars in component CSS.
3. **No raw color escapes** — the grep in the checklist is the gate.

## When you might be tempted to break it

- "I just need this one badge to be brand-blue." → Add a `--brand-blue` token to the theme and use `bg-brand-blue`. Never inline.
- "The designer specified `#0F172A`." → That value belongs in `tokens.css` as `--foreground` (or whatever role it serves). Never in a component class.
- "Tailwind has nicer color ramps." → Yes, and they're stale the moment the theme changes.

## Further reading

- shadcn/ui theming docs — the canonical reference for this token set.
- open-design `frontend-design` — broader UI-discipline checklist.
