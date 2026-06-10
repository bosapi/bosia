---
name: bosia-mobile-screen
description: Mobile-first +page.svelte at 375px viewport. Touch targets ≥44px. Safe-area insets. Bottom action bar pattern.
triggers:
  - mobile screen
  - mobile page
  - 375
  - phone view
  - touch ui
od:
  mode: page-scaffold
  category: mobile
bosia:
  design: true
  requires:
    blocks: []
    themes: [neutral]
    components: [ui/button, ui/input, ui/dialog, ui/icon, ui/typography]
    feats: []
  targets:
    routes: ["src/routes/m/+page.svelte"]
  stack: [svelte-5-runes, tailwind-v4]
---

# bosia-mobile-screen

## What it builds

A `+page.svelte` designed mobile-first: sticky header, scrollable content, optional bottom action bar, safe-area-aware padding. Designed against the iPhone-SE 375×667 viewport.

## When to use

User asks for a "mobile screen", "phone view", or any UI where mobile is primary surface (web-wrapped app screens, scan-flows, on-device kiosks).

## Rules

### R1 — Bottom-anchored modality

On mobile, prefer transient surfaces that drop from the bottom edge (thumb zone). Today the registry ships `ui/dialog`; until a `ui/sheet` primitive lands, style the dialog with bottom-anchored CSS classes (`bottom-0 inset-x-0 rounded-t-xl rounded-b-none`).

### R2 — Touch targets ≥ 44×44

`min-h-11 min-w-11` on tap targets. `ui/button` `size="default"` already meets this.

### R3 — Safe area

Add `pb-[env(safe-area-inset-bottom)]` to bottom-anchored bars; `pt-[env(safe-area-inset-top)]` to fixed top bars.

### R4 — Sticky header + scroll body

```svelte
<div class="flex h-svh flex-col">
	<header class="sticky top-0 …">…</header>
	<main class="flex-1 overflow-y-auto …">…</main>
	<footer class="…">…</footer>
</div>
```

Use `h-svh` not `h-screen` — handles iOS browser chrome correctly.

### R5 — Input zoom guard

On iOS Safari, inputs with `font-size < 16px` auto-zoom. Use `text-base` (16px) on inputs.

### R6 — Bottom action bar

Primary action goes at the bottom on mobile (thumb zone). For destructive flows, place the destructive button at the bottom with a confirmation step.

## Workflow

1. **Read `BRIEF.md § Aesthetic`.** Apply the locked `Direction` to the mobile composition WITHOUT abandoning it for "it doesn't fit at 375px" — redesign the mobile composition to carry the same stance (e.g. brutalist → still mono + visible grid + hairline borders, just stacked; playful → still bouncy easing + oversaturated primaries, just full-width). The named `Memorable detail` adapts to mobile (custom cursor → custom tap state; oversized footer wordmark → still oversized but stacked). Do not silently swap to "default mobile clean" — that is the AI default this whole pipeline exists to prevent.
2. `bosia add theme/neutral ui/button ui/input ui/dialog ui/icon ui/typography`.
3. Create `+page.svelte` at the chosen route.
4. Apply the layout skeleton (header / scroll body / footer).
5. Run `bosia-design-review` + `bosia-accessibility-review`.

## Checklist gate

P0:

- [ ] Renders at 375px with no horizontal scroll.
- [ ] All tap targets ≥ 44×44.
- [ ] `h-svh` not `h-screen` on root.
- [ ] Inputs `text-base` (no iOS zoom).
- [ ] Safe-area insets on top/bottom fixed bars.
- [ ] BRIEF.md § Aesthetic direction carried into mobile composition (not silently dropped); memorable detail adapted to mobile, not removed.

P1:

- [ ] Bottom action bar holds the primary action.
- [ ] Transient surfaces drop from the bottom edge (thumb zone) — bottom-anchored dialog until `ui/sheet` lands.
- [ ] Long lists virtualize or paginate at >100 items.

## References

- `references/design-principles.md`
- `references/checklist.md`
- `example.svelte`
