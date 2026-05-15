# Design review — full checklist

Format: `[ ] item — rationale — how to fix`.

## P0 — must pass

### 1. Semantic tokens only

- **Check:** grep `\b(bg|text|border|ring|fill|stroke)-(white|black|zinc|gray|slate|neutral|stone|red|blue|green|yellow|amber|orange|emerald|teal|cyan|sky|indigo|violet|purple|fuchsia|pink|rose|lime)-[0-9]{2,3}\b` returns nothing.
- **Why:** raw colors break theme swap + dark mode.
- **Fix:** see `bosia-theme-tokens` for the role map (`bg-card`, `text-foreground`, …).

### 2. Runes only

- **Check:** grep for `export let`, `$:`, `import { writable } from 'svelte/store'`.
- **Why:** legacy reactivity drifts from Svelte 5 semantics.
- **Fix:** see `bosia-svelte-runes`.

### 3. Registry-first

- **Check:** every custom card/button/input has a registry equivalent already installed.
- **Why:** duplicate primitives drift in look + a11y.
- **Fix:** `bosia add ui/<component>` and replace the hand-rolled version.

### 4. Async coverage

- **Check:** each `await` or fetched value renders loading, empty, and error UI.
- **Why:** blank screens on failure are the #1 perceived-quality killer.
- **Fix:** see `bosia-empty-states` (uses `ui/empty`, `ui/skeleton`, `ui/spinner`).

### 5. Mobile safe at 375px

- **Check:** mentally render at iPhone SE width. Anything that overflows, wraps poorly, or has touch targets <44px fails.
- **Why:** half the traffic.
- **Fix:** `flex-wrap`, `min-w-0`, `truncate`, `min-h-11` on tap targets.

### 6. Typography hierarchy

- **Check:** exactly one `<h1>`; subsequent headings descend (`h1 → h2 → h3`); body text uses `ui/typography` classes.
- **Why:** screen readers + skimmability.
- **Fix:** install `ui/typography`; use its `Text.H1`, `Text.H2`, … snippets.

## P1 — should pass

### 7. Spacing rhythm

Use `gap-2/3/4/6/8/10/12` and `p-*` from Tailwind scale. Arbitrary `px-[13px]` is a smell.

### 8. Interaction states

Hover, active, focus, disabled — all visible. `ui/button` carries these; hand-rolled buttons usually skip focus.

### 9. Forms

`ui/form` (wrapper) + `ui/field` (label + error slot) + `ui/input`. Naked `<input class="…">` skips validation messaging and label association.

### 10. Scroll containment

Use `overflow-y-auto` on the _container_ of long content. Letting the whole page scroll when a panel should scroll is a common defect on dashboards.

### 11. Icon consistency

One icon set, one stroke width, one size scale. `ui/icon` enforces this.

### 12. Empty / placeholder copy

Empty states need a one-line explanation + a primary action. "No results" alone is failure.

### 13. Loading skeletons match final shape

Skeleton block sizes approximate the rendered content — no big layout shift.

### 14. Content density

Body text 14–16px, line-height 1.5+, max line length ~70ch. Walls of text = failure.
