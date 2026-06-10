---
name: bosia-theme-tokens
description: Use semantic Tailwind tokens only — `bg-card`, `text-foreground`, `border-border`. Never raw colors (`bg-white`, `text-zinc-900`). Theme swap = swap `tokens.css`, no code change.
triggers:
  - colors
  - theme
  - dark mode
  - styling
  - tailwind classes
od:
  mode: convention
  category: design
bosia:
  design: true
  requires:
    blocks: []
    themes:
      [neutral, editorial, zinc, stone, claude, ocean, forest, rose, sunset, midnight, mono, amber]
    components: []
    feats: []
  targets:
    routes: []
  stack: [tailwind-v4]
---

# bosia-theme-tokens

## What it builds

UI that swaps look-and-feel by changing only `tokens.css` (the `theme/*` registry entry). No grep-and-replace across components.

## When to use

Every UI emit. Including Bosapi's own views.

## The semantic token set

These are the only color/surface classes you may write. They map to CSS variables defined by the active theme.

| Use for                   | Class                                          | Source token                    |
| ------------------------- | ---------------------------------------------- | ------------------------------- |
| Page surface              | `bg-background` `text-foreground`              | `--background` / `--foreground` |
| Card surface              | `bg-card` `text-card-foreground`               | `--card` / `--card-foreground`  |
| Popover / floating        | `bg-popover` `text-popover-foreground`         | `--popover`                     |
| Primary action            | `bg-primary` `text-primary-foreground`         | `--primary`                     |
| Secondary action          | `bg-secondary` `text-secondary-foreground`     | `--secondary`                   |
| Muted text / surface      | `bg-muted` `text-muted-foreground`             | `--muted`                       |
| Accent (hover/selected)   | `bg-accent` `text-accent-foreground`           | `--accent`                      |
| Destructive (danger)      | `bg-destructive` `text-destructive-foreground` | `--destructive`                 |
| Border                    | `border-border`                                | `--border`                      |
| Input border / focus ring | `border-input` `ring-ring`                     | `--input` / `--ring`            |

Radius: `rounded-sm/md/lg/xl` map to `--radius` derivatives.

Charts: `chart-1` … `chart-5` for series colors.

## Hard rule — no raw colors

```svelte
<!-- ❌ -->
<div class="bg-white text-zinc-900 border-gray-200">…</div>
<div class="bg-blue-600 text-white">…</div>

<!-- ✅ -->
<div class="bg-card text-card-foreground border-border">…</div>
<button class="bg-primary text-primary-foreground">…</button>
```

The grep `\b(bg|text|border|ring|fill|stroke)-(white|black|zinc|gray|slate|neutral|stone|red|blue|green|yellow|amber|orange|emerald|teal|cyan|sky|indigo|violet|purple|fuchsia|pink|rose|lime)-[0-9]{2,3}\b` should return zero hits in any committed `.svelte`.

Exception: brand-locked illustrations / SVGs embedded as data — and even then, prefer semantic tokens where the design allows.

## Theme swap

Twelve themes ship in the registry — see [Themes overview](/docs/themes/overview/) for the full list. Default is `theme/neutral`.

```bash
# inside a Bosia project
bosia add theme/editorial   # writes src/app.css with new --foreground, --primary, …
```

Nothing in components changes.

## Workflow

1. Pick a theme via the registry — install one before writing UI.
2. Use only the semantic classes above.
3. If you want to write a raw color → ask: which semantic role does this serve? Use that instead. If no role fits, propose a new token in `tokens.css`.

## Anti-patterns

- `bg-white`, `text-black`, `border-gray-200`, etc.
- Hex / RGB inline styles.
- Hardcoded dark-mode classes (`dark:bg-zinc-900`). Tokens already adapt.
- Duplicate "card-bg" CSS vars in component scope.

## Checklist gate

P0:

- [ ] Zero raw color classes in committed `.svelte` (grep above).
- [ ] A theme registry entry is installed (any of the 12 in `registry/themes/`).
- [ ] Border colors use `border-border` / `border-input`.

P1:

- [ ] Hover states use `accent` tokens, not raw.
- [ ] Focus rings use `ring-ring`.
- [ ] Chart series use `chart-1`..`chart-5`.

## References

- `references/design-principles.md` — open-design lineage for the semantic-token discipline.
