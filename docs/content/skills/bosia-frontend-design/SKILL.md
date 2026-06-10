---
name: bosia-frontend-design
description: Commit to a BOLD aesthetic direction before emitting UI. Avoid generic AI slop — distinctive typography, dominant colors with sharp accents, intentional spatial composition, atmospheric backgrounds. Bosia-flavored (Svelte 5 + theme tokens + registry-first).
triggers:
  - aesthetic direction
  - distinctive design
  - design vision
  - look and feel
  - polish ui
  - hero design
  - landing aesthetic
  - avoid generic
od:
  mode: convention
  category: design
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
    routes: []
  stack: [svelte-5-runes, tailwind-v4]
---

# bosia-frontend-design

## What it builds

Not code on its own. A **stance** you commit to before any page scaffold or block compose runs. Outputs a one-paragraph aesthetic brief that downstream skills (`bosia-landing`, `bosia-saas-landing`, `bosia-blog`, `bosia-pricing`, `bosia-mobile-screen`, `bosia-dashboard`) inherit.

Without a stance, every page converges on the same "AI default": soft purple gradient on white, Inter, 3-up card grid, evenly distributed spacing. This skill prevents that.

## When to use

- Before the first UI emit in a new Bosia app — right after `bosia-brief-intake`, before any page scaffold.
- When the user says "make it more distinctive", "less generic", "more polished", "the design feels flat", "looks like every AI site".
- When picking a theme feels arbitrary — this skill anchors the choice.

Anti-trigger: pure code-correctness work (Drizzle, RBAC, routing). Use only when UI emission is in scope.

## The four design decisions

Before emitting, lock these in writing inside `BRIEF.md` under `## Aesthetic` (or echo back to user if BRIEF.md not yet written):

### 1. Direction — pick ONE extreme

Don't blend. Don't hedge. Pick one of:

- **Brutally minimal** — mono palette, oversized type, generous whitespace, hairline borders, near-zero motion.
- **Editorial / magazine** — serif display, asymmetric grid, large hero image, generous leading, pull quotes.
- **Brutalist / raw** — system mono, visible grid lines, sharp corners, unstyled-looking inputs, dense type, no shadows.
- **Retro-futuristic** — 70s/80s palette (amber, teal, magenta), CRT scanline overlay, monospaced display, sharp geometric icons.
- **Maximalist / chaotic** — overlapping layers, multiple type families, dense color, decorative borders, expressive motion.
- **Soft / pastel** — low-saturation palette, generous rounded corners, soft drop shadows, friendly script accents.
- **Luxury / refined** — restrained palette (cream, charcoal, single accent), wide-tracking sans display, high contrast, micro motion.
- **Industrial / utilitarian** — desaturated grays, dense data tables, monospace numerics, square corners, minimal chrome.
- **Organic / natural** — earth tones, hand-drawn accents, irregular shapes, generous whitespace, slow easing.
- **Playful / toy-like** — bouncy easing, oversaturated primaries, rounded everything, big hover wiggles, friendly mascots.
- **Art deco / geometric** — symmetric layouts, gold/black accents, geometric ornaments, tall narrow type.

Or invent one true to the brief. The catalog is a launchpad, not a menu.

See `references/aesthetic-directions.md` for fuller breakdowns.

### 2. Typography — distinctive, not default

- **Avoid**: Inter, Roboto, Arial, system stack, Space Grotesk (overused).
- **Pair**: one distinctive **display** face + one refined **body** face. Or commit to a single mono.
- **Suggestions by direction** (not a script — pick what fits):
  - Editorial → `Fraunces` / `Cormorant` display + `Inter Tight` or `Newsreader` body.
  - Brutalist → `Departure Mono` or `JetBrains Mono` for everything.
  - Luxury → `Tenor Sans` or `Cormorant` display + `Inter Tight` body.
  - Retro → `VT323` / `Major Mono Display` + `IBM Plex Mono` body.
  - Maximalist → `Boldonse` or `Caprasimo` display + `DM Sans` body.
  - Soft → `Fraunces` (with variable axis) + `Plus Jakarta Sans`.
- **Wire it**: load via Fontsource or Google Fonts in `app.css`, override Tailwind's `font-sans` / `font-serif` / `font-mono` in `app.css` `@theme` block — never per-component `style="font-family:"`.

### 3. Color stance — dominant + sharp accent

- Pick the right **theme registry entry first** (`theme/neutral` or `theme/editorial`), then override `--primary` / `--accent` in `tokens.css` to match direction.
- **80/15/5 rule**: 80% one surface tone, 15% secondary surface, 5% accent. Resist evenly distributed palettes — they read as "AI default".
- Accent should be **sharp**, not safe. Saffron, electric blue, signal red, jade — committed hues, not pastel-of-everything.
- Light vs dark: vary between sessions. Dark mode is not the default just because it looks "designed".

### 4. The memorable detail

One thing a viewer will remember. Pick one — not five:

- A custom cursor on the hero.
- A staggered word-by-word reveal on the headline (CSS `@starting-style` or `svelte/transition`).
- A scroll-driven progress bar tied to article reading.
- A grain texture over the background (subtle SVG noise).
- A diagonal section divider that breaks the grid.
- An oversized footer wordmark that runs to the edge.
- A hover state that reveals a hidden caption.
- A single hand-illustrated mark.

If you can't name the memorable detail, the design isn't done.

## Bosia conventions — non-negotiable

This skill amplifies aesthetic ambition; it does **not** override Bosia's correctness rules.

- **Colors come from semantic tokens.** `bg-card`, `text-foreground`, `bg-primary` — never `bg-purple-600`. To change palette, edit `tokens.css` (`bosia-theme-tokens`).
- **Components come from the registry first.** `list_registry()` → `bosia add`. Hand-rolled DOM is the last resort, after blocks and `ui/*` primitives (`bosia-block-compose`).
- **Reactivity uses Svelte 5 Runes.** No `export let`, no `$:`, no legacy stores (`bosia-svelte-runes`).
- **Motion uses CSS transitions or `svelte/transition` / `svelte/motion`** — no React-only libraries (no Framer Motion, no GSAP unless absolutely justified and added as a Bosia feat).
- **Mobile-safe at 375px.** Bold design that breaks on mobile is not bold, it's broken.
- **Accessibility is not optional.** Contrast ≥4.5:1 on body text even with a bold palette. `bosia-accessibility-review` still gates the emit.

## Workflow

1. **Re-read `BRIEF.md` § Identity / § Visual.** Direction must serve the audience and voice, not contradict them.
2. **Write a one-paragraph stance** (see template below). Save under `BRIEF.md` § Aesthetic.
3. **Install or swap the theme**: `bosia add theme/<neutral|editorial>`. Override `--primary` / `--accent` / radius in `tokens.css` if needed.
4. **Wire fonts** in `app.css` (Fontsource or Google Fonts), set `@theme { --font-sans / --font-serif / --font-mono }`.
5. **Pick a page scaffold** (`bosia-landing`, `bosia-saas-landing`, etc.) and emit with the stance applied.
6. **Add the memorable detail** as a discrete, named element — not sprinkled.
7. **Run `bosia-design-review` + `bosia-accessibility-review`**. Bold ≠ exempt.

## Stance template (paste into BRIEF.md § Aesthetic)

```md
## Aesthetic

- **Direction**: [one of: brutally-minimal | editorial | brutalist | retro-futuristic | maximalist | soft-pastel | luxury | industrial | organic | playful | art-deco | custom-named]
- **Display font**: [name + source]
- **Body font**: [name + source]
- **Theme base**: theme/[neutral|editorial]
- **Accent**: [hex or named hue → wired as `--accent` in tokens.css]
- **Light or dark default**: [light | dark]
- **Memorable detail**: [one sentence — the thing a viewer will remember]
- **What we are NOT**: [one sentence — the default we are rejecting, e.g. "not a soft purple gradient SaaS landing"]
```

## Checklist gate

P0:

- [ ] BRIEF.md § Aesthetic written and locked before any page scaffold runs.
- [ ] Theme registry entry installed; `--primary` and `--accent` reflect the stance.
- [ ] Fonts wired in `app.css` `@theme` block — not per-component.
- [ ] No raw color classes (`bosia-theme-tokens` grep clean).
- [ ] One named memorable detail present on the primary surface.
- [ ] Mobile-safe at 375px; contrast ≥4.5:1 on body text.

P1:

- [ ] Spacing follows Tailwind scale; intentional asymmetry where direction calls for it.
- [ ] One page-load reveal sequence (staggered) — not five scattered micro-interactions.
- [ ] Background carries atmosphere (gradient mesh, grain, geometric pattern) — not flat fill unless direction is brutally-minimal.
- [ ] Hover states reward attention; focus states are equally considered.

## Anti-patterns

- "Modern, clean, professional" as the only descriptor → that's the AI default, not a direction.
- Soft purple gradient on white. Stop.
- Inter or Space Grotesk picked because they "look designed".
- Five accent colors evenly weighted → reads as a chart, not a brand.
- Decorative motion on every element → competes with itself, nothing reads as the hero moment.
- Bold direction abandoned at 375px because "it doesn't fit" — redesign the mobile composition, don't drop the stance.

## References

- `references/design-principles.md` — open-design `frontend-design` lineage adapted to Bosia.
- `references/aesthetic-directions.md` — fuller breakdowns of the 11 starter directions with palette/type/motion notes.
