---
name: bosia-brief-visual
description: Capture visual direction — palette intent → theme pick, shape (radius), density (shadows), type, icon set, custom marks. Ends by running `bosia_add_theme` so subsequent UI emits inherit the chosen tokens.
triggers:
    - palette
    - colors
    - theme
    - typography
    - icons
    - visual direction
od:
    mode: intake
    category: discovery
bosia:
    design: true
    requires:
        blocks: []
        themes: [neutral, editorial]
        components: []
        feats: []
    targets:
        files:
            - "BRIEF.md"
            - "src/app.css"
    stack: [tailwind-v4]
---

# bosia-brief-visual

## What it captures

Visual direction expressed as **intent**, not as a token table. Bosia's semantic tokens own the actual values (`bosia-theme-tokens`). This skill picks the _intent_ and the _theme_, then installs.

| Field            | Options                                                                                    | Drives                                           |
| ---------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| `palette_intent` | `warm-earthy` / `cool-tech` / `minimal-mono` / `playful-bright` / `dark-luxury` / `custom` | Theme pick + `--primary`/`--accent` choice       |
| `theme_choice`   | `neutral` / `editorial` / `custom`                                                         | `bosia_add_theme` argument                       |
| `brand_colors`   | optional 1–3 hex values                                                                    | Custom theme overrides on `--primary`/`--accent` |
| `shape`          | `sharp` (4px) / `soft` (10px) / `pill`                                                     | `--radius`                                       |
| `density`        | `flat` / `subtle` / `pronounced`                                                           | Default shadow tier                              |
| `type`           | `default-inter` / `serif-editorial` / `system` / `custom-pair`                             | Font imports + `--font-sans`                     |
| `mono_usage`     | `none` / `ids-only` / `code-heavy`                                                         | Whether to import JetBrains Mono                 |
| `icon_set`       | `lucide` / `mixed` / `custom`                                                              | Default icon source                              |
| `custom_marks`   | list (e.g. `sheep`, `qr-flock`)                                                            | SVG files to author in `src/lib/assets/`         |

## Palette intent → theme decision matrix

| Intent           | Default theme                                                 | Why                                                                           |
| ---------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `warm-earthy`    | `editorial` then override `--primary`/`--accent` to warm hues | Editorial's whitespace + serif-friendly bones match agrarian/wellness brands. |
| `cool-tech`      | `neutral`                                                     | Neutral's defaults are already cool/disciplined.                              |
| `minimal-mono`   | `neutral` with `--accent` → near-black                        | Neutral collapses cleanly to monochrome.                                      |
| `playful-bright` | `editorial` with saturated `--primary` + `--accent`           | Editorial gives air for saturated brand color to breathe.                     |
| `dark-luxury`    | `neutral` in dark mode + low-saturation gold accent           | Neutral dark tokens + restrained accent reads as luxury, not gamer.           |
| `custom`         | `neutral` as canvas, full token override                      | Last resort — author a project-specific theme entry.                          |

## Questions to ask

1. **Palette intent — pick one.** Show the table above with one-line vibe per option.
2. **Brand colors — any locked hex values?** Optional. If `none` and intent is `custom`, fall back to intent default.
3. **Shape — how round are the corners?** `sharp 4px` (technical), `soft 10px` (modern default), `pill` (consumer/social).
4. **Density — how raised do surfaces feel?** `flat` (almost no shadow, hairline borders), `subtle` (xs shadow, the default), `pronounced` (sm-md shadows, more separation).
5. **Type — confirm or change.** Default is `default-inter` (Inter via Google Fonts, the Bosia ship-default). Override only if user wants serif-display, system, or a paired family.
6. **Mono usage?** `none` / `ids-only` (recommended if `bosia-brief-platform` will define an ID format) / `code-heavy` (only for devtools-like apps).
7. **Icons — `lucide` default OK?** `mixed` if user needs filled icons that lucide lacks. `custom` only if user is committed to authoring a set.
8. **Custom marks — any domain glyphs not in lucide?** Examples: `sheep`, `truck-livestock`, `qr-flock`. List names; agent authors SVGs later.

## Rules

### R1 — Semantic tokens only (always)

Reaffirm `bosia-theme-tokens`. After theme install, every UI emit uses `bg-primary`/`text-foreground`/`border-border`. **Never** `bg-amber-700` even if brand color is amber.

### R2 — Brand colors map to `--primary` and `--accent`, not raw classes

If brief says `brand_colors: ["#3F6B3A", "#8B5E3C"]`:

```css
/* src/app.css — written AFTER bosia_add_theme */
:root {
	--primary: oklch(from #3f6b3a);
	--accent: oklch(from #8b5e3c);
}
```

Then `<button class="bg-primary">` renders in brand green. No `bg-[#3F6B3A]`.

### R3 — Shape locks `--radius`, not per-component

Set `--radius` once. Components inherit via `rounded-md` / `rounded-lg`. Don't override `rounded-*` per component to chase a hand-tuned look — fix `--radius` and let the system propagate.

### R4 — Density locks default shadow tier

`flat` → most surfaces use `shadow-none` + hairline border. `subtle` → `shadow-xs`. `pronounced` → `shadow-sm` baseline, `shadow-md` on hover. Pick once; don't toggle per surface.

### R5 — Type sticks to one + one mono

Max two families. `default-inter` is one family. `custom-pair` is sans + display serif or sans + condensed display. Three families = noise.

### R6 — Icon stroke and size consistent

`lucide` defaults: 1.5px stroke, 24×24 viewbox, `currentColor`. Custom marks MUST match (1.5px stroke, rounded caps, 22×22 optical inside 24×24 box). Don't mix stroke weights.

### R7 — No gradients on UI surfaces

Gradient bgs forbidden on cards, buttons, headers in app shell. Reserved for marketing hero, full-bleed photo overlays. State this in BRIEF.md no-go even if not explicitly asked.

### R8 — Warm-leaning neutrals when palette is warm

`warm-earthy` intent → override neutral scale to warm-leaning (slight yellow cast). Pure-cool gray on warm primary reads as cheap. Document in the custom theme block.

## Workflow side effects

After answers locked, this skill executes:

1. `bosia_add_theme <theme_choice>` (e.g. `editorial`).
2. If `brand_colors` given OR `palette_intent` differs from theme's defaults: `fs_read("src/app.css")` → `fs_edit` to override `--primary`/`--accent`/(optionally `--radius`).
3. If `mono_usage` ≠ `none`: ensure JetBrains Mono import + `--font-mono` set.
4. If `custom_marks` given: queue SVG authoring for the platform-skill pass (mark them as pending in BRIEF.md, don't author yet).

Confirm each change to the user with a one-line summary before writing.

## Anti-patterns

- Hand-rolling a theme by writing raw colors in `src/app.css` without going through `bosia_add_theme` first. Always install a theme entry, THEN override variables.
- Picking `custom` when one of the 5 intents fits. Custom doubles the work and breaks future theme upgrades.
- Letting the agent decide brand colors silently. If user didn't lock hex values, use the intent's defaults and SAY SO in the confirm.
- Three or more font families.
- Mixing lucide + heroicons + tabler in one app.
- Adding `dark:bg-*` raw classes. Theme handles dark mode via tokens.

## Output to BRIEF.md

Write under `## Visual`:

```markdown
## Visual

- Palette intent: warm-earthy
- Theme installed: editorial (overridden)
- Brand colors: #3F6B3A (primary), #8B5E3C (accent)
- Shape: soft (10px)
- Density: subtle (shadow-xs baseline)
- Type: default-inter
- Mono usage: ids-only (JetBrains Mono)
- Icon set: lucide + 1 custom (sheep)
- Custom marks needed: sheep (pending author in src/lib/assets/icon-sheep.svg)
```

## Checklist gate

P0:

- [ ] `palette_intent` set.
- [ ] `theme_choice` matches matrix or is explicitly `custom` with rationale.
- [ ] `bosia_add_theme` ran (verify `src/app.css` has theme tokens via `fs_read`).
- [ ] If brand colors given, `--primary`/`--accent` overridden in `src/app.css`.
- [ ] `--radius` value matches `shape`.
- [ ] No raw color classes anywhere in `src/**/*.svelte` (run `bosia-theme-tokens` grep mentally).

P1:

- [ ] `--font-sans` matches `type` choice.
- [ ] Mono imported only if `mono_usage` ≠ `none`.
- [ ] Custom marks queued; matching lucide stroke and viewbox.
- [ ] Dark mode behaves (token-only, no `dark:bg-*` raw classes).

## References

- `bosia-theme-tokens` — semantic token rules this skill enforces.
- `bosia-brief-intake` — orchestrator.
- `bosia-brief-platform` — runs after; uses `id_format` to drive mono pill components.
