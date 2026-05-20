---
name: bosia-app-css
description: Canonical `src/app.css` structure. `@import url(...)` (fonts) must come FIRST, before `@import "tailwindcss"` — Tailwind v4 + LightningCSS silently drops out-of-order imports. Fonts wire through theme tokens (`--font-display`/`--font-body`), never raw `font-family` stacks. Use `bosia add theme/<name>` for fonts; for ad-hoc fonts, prepend the `@import url(...)` (mirror `mergeFontImports()`).
triggers:
    - app.css
    - fonts
    - google fonts
    - "@import"
    - "@theme"
    - "@source"
    - font-family
    - tailwind setup
    - css build
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
        routes: []
    stack: [tailwind-v4]
---

# bosia-app-css

## What it builds

A `src/app.css` that compiles cleanly through `@tailwindcss/cli` (v4 / LightningCSS) into `public/bosia-tw.css`, with theme tokens, Google Fonts, and registry `@source` paths all surviving the build.

## When to use

- Any edit to `src/app.css`.
- Adding fonts (Google Fonts, self-hosted, etc.).
- Wiring a registry theme (`bosia add theme/<name>`).
- Debugging "my font/theme isn't applying" or "CSS variable missing in built output."

## Canonical skeleton — order matters

```css
/* ─── 1. Font @imports (MUST be first) ──────────────────────── */
/* bosia-font: Fredoka */
@import url("https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap");

/* ─── 2. Tailwind engine ─────────────────────────────────────── */
@import "tailwindcss";

/* ─── 3. Source scan paths (Tailwind v4 directive) ───────────── */
@source "../src";
/* Add registry roots only in monorepo demo apps, not user projects */

/* ─── 4. Theme overlay (installed by `bosia add theme/<name>`) ─ */
/* bosia-theme */
@import "./lib/themes/neutral.css";

/* ─── 5. (Optional) project-local @theme additions ───────────── */
@theme {
	--font-display: "Fredoka", sans-serif; /* override theme default */
}

/* ─── 6. Base styles — read from tokens, never raw stacks ────── */
@layer base {
	* {
		border-color: theme(--color-border);
	}
	body {
		background-color: theme(--color-background);
		color: theme(--color-foreground);
		font-family: var(--font-body);
	}
	h1,
	h2,
	h3,
	h4,
	h5,
	h6 {
		font-family: var(--font-display);
	}
}
```

## Hard rule — `@import url(...)` first

CSS spec: `@import` must precede all other rules (except `@charset` / `@layer`). Tailwind v4 inlines `@import "tailwindcss"` into actual rules before LightningCSS sees the rest of the file. So **any `@import url(...)` placed AFTER `@import "tailwindcss"` is silently dropped from `public/bosia-tw.css`** — the `font-family: "Fredoka"` declaration stays, but the font file never loads.

```css
/* ❌ Silently dropped — font never loads */
@import "tailwindcss";
@source "../src";
@import url("https://fonts.googleapis.com/css2?family=Fredoka&display=swap");

/* ✅ Survives the build */
@import url("https://fonts.googleapis.com/css2?family=Fredoka&display=swap");
@import "tailwindcss";
@source "../src";
```

Watch for the LightningCSS warning `@import rules must precede all rules aside from @charset and @layer statements` during build — that's the smoking gun.

## Preferred path — let the framework wire fonts

The Bosia CLI prepends font `@import url(...)` lines with `/* bosia-font: <family> */` markers, idempotently, in the correct position.

```bash
# Themes that declare fonts in registry/themes/<name>/meta.json
# auto-install them on `bosia add theme <name>`
bosia add theme editorial  # adds Instrument Serif + Inter to app.css top

# Ad-hoc fonts (not tied to a theme)
bosia add font "Fredoka" \
  "https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap"
```

Both commands prepend the `@import url(...)` line with a `/* bosia-font: <Family> */` marker. Idempotent — re-adding the same family is a no-op. AI agents in Bosapi expose this as the `bosia_add_font` tool — prefer it over `fs_write` / `fs_edit` on `src/app.css` when adding fonts.

Sources: `packages/bosia/src/cli/font.ts` (`runAddFont`) → `packages/bosia/src/cli/fonts.ts` (`mergeFontImports`).

## Fonts go through tokens, not raw stacks

Theme `tokens.css` files declare `--font-display` and `--font-body` inside `@theme {}`. Base styles read them via `var(--font-body)`. Components should not hard-code `font-family: "Inter", sans-serif;`.

```css
/* ❌ Raw stack in body — won't change when theme swaps */
body {
	font-family: "Inter", system-ui, sans-serif;
}

/* ✅ Theme token — swaps with theme */
body {
	font-family: var(--font-body);
}
h1,
h2,
h3 {
	font-family: var(--font-display);
}
```

To override a single token without forking the whole theme, add a small `@theme {}` block AFTER the theme `@import`:

```css
@import "./lib/themes/neutral.css";
@theme {
	--font-display: "Fredoka", sans-serif;
}
```

## `@source` directives

Tailwind v4 scans for class names. `@source "../src"` is the default for user projects. Add registry paths only in the bosia monorepo demo / docs apps:

```css
/* user project — single source */
@source "../src";

/* monorepo demo app — also scan registry */
@source "../src";
@source "../../../registry/components";
@source "../../../registry/blocks";
```

## Anti-patterns

- `@import url(googleapis...)` placed after `@import "tailwindcss"` or `@source`.
- Hand-appending fonts at the bottom of `app.css` instead of prepending (font files never load).
- Hard-coded `font-family: "Inter", …` in `body {}` — bypasses theme swap.
- Duplicate `@theme {}` blocks redefining the same `--color-*` variables.
- Editing `src/lib/themes/<name>.css` directly to add fonts — overridden on next `bosia add theme/<name>`. Add to project `app.css` instead.
- Manually patching `public/bosia-tw.css` — it's a build artifact, gets overwritten.

## Workflow

1. Start from `bosia init` default `src/app.css` skeleton.
2. Install a theme first: `bosia add theme <name>` — wires `@import "./lib/themes/<name>.css"` and any theme-declared fonts.
3. Need a custom font on top of the theme? Run `bosia add font "<Family>" "<url>"` (or `bosia_add_font` in Bosapi). Never hand-append to the bottom of `app.css`.
4. Override `--font-display` / `--font-body` in a small `@theme {}` block AFTER the theme import.
5. Read fonts in `@layer base` via `var(--font-body)` / `var(--font-display)`.
6. Run `bun run build` (or restart dev) and grep the output: `grep -i "googleapis\|<Family>" public/bosia-tw.css` — must find the `@import url(...)` line.

## Checklist gate

P0:

- [ ] All `@import url(...)` lines are above `@import "tailwindcss"`.
- [ ] No LightningCSS warning `@import rules must precede all rules` during build.
- [ ] `public/bosia-tw.css` contains the expected `@import url("https://fonts.googleapis.com/...")` line.
- [ ] Body `font-family` reads `var(--font-body)`, not a raw stack.

P1:

- [ ] Custom-font `@import url(...)` lines carry a `/* bosia-font: <Family> */` marker for idempotency.
- [ ] No duplicate `@theme {}` blocks redefining the same token.
- [ ] `@source` lists registry paths only in monorepo demo/docs apps.
- [ ] Heading `font-family` reads `var(--font-display)`.

## References

- `packages/bosia/src/cli/fonts.ts` — `mergeFontImports` / `removeFontImports`, the canonical prepend mechanism.
- `packages/bosia/src/cli/theme.ts` — `bosia add theme/<name>` flow that wires `@import` + fonts.
- `packages/bosia/src/core/build.ts:116` — Tailwind CLI invocation (`-i ./src/app.css -o ./public/bosia-tw.css`).
- `packages/bosia/templates/default/src/app.css` — baseline skeleton (shadcn-style `:root` + `.dark` + `@theme`).
- `apps/demo/src/app.css` — theme-overlay variant.
- `registry/themes/editorial/meta.json` — example of a theme that ships fonts.
- Companion skill: `bosia-theme-tokens` (semantic class usage on top of the tokens declared here).
