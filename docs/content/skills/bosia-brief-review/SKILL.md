---
name: bosia-brief-review
description: Quality gate after intake. Verifies BRIEF.md sections complete (incl. § Aesthetic stance), theme installed matches `visual.theme_choice`, distinctive fonts wired in app.css `@theme`, accent override applied, ID/number/date formatters scaffolded, first-screen blocks present, no contradictions. Run before any non-brief UI emit.
triggers:
    - brief review
    - intake review
    - before first build
    - is the brief done
od:
    mode: quality-gate
    category: discovery
bosia:
    design: true
    requires:
        blocks: []
        themes: []
        components: []
        feats: []
    targets:
        files:
            - "BRIEF.md"
            - "src/app.css"
            - "src/lib/format/id.ts"
            - "src/lib/format/num.ts"
            - "src/lib/format/date.ts"
    stack: []
---

# bosia-brief-review

## What it does

Audits the brief + the scaffolded state right after `bosia-brief-intake` finishes. Catches contradictions between BRIEF.md and disk before the agent emits a single feature view.

## When to run

Always, immediately after `bosia-brief-intake` writes `## Status: complete`. Re-run any time BRIEF.md is edited.

Skip only inside an editing turn that explicitly _modifies_ the brief.

## Workflow

1. `fs_read("BRIEF.md")` — confirm all four sections present + `## Status: complete`.
2. Parse the four sections into a working memory map.
3. Walk the P0 checks below in order. Any fail → halt, report the gap, ask user to resolve.
4. Walk P1 checks. Note misses; fix if cheap (single tool call), defer otherwise.
5. If all P0 pass: greenlight feature work. Write a one-paragraph recap to the user: name, primary surface, theme, first-screen list, top 3 features.

## P0 — must pass

### B1 — All five sections populated

`## Identity`, `## Voice`, `## Visual`, `## Aesthetic`, `## Platform` all present and non-empty. No `TBD`, no empty bullet, no "see chat".

### B2 — Microcopy spine table complete

All 5 rows (Empty / Error / Confirm destructive / Success / Primary action) have both ❌ and ✅ entries. No row says "default" or is missing the ❌ side.

### B3 — Theme installed matches brief

`fs_read("src/app.css")` and confirm:

- Theme tokens present (`--primary`, `--accent`, `--background`, etc.).
- If `brand_colors` declared in brief: `--primary` and `--accent` values reflect them (not the registry defaults).
- If `shape` is `sharp`: `--radius` ≤ 6px. If `pill`: `--radius` is full or ≥9999px-equivalent. If `soft`: ≈10px.

### B4 — Formatter modules scaffolded

If `id_format` declared: `fs_read("src/lib/format/id.ts")` returns a file with `ID_FORMAT` + `formatId`. Same for `num.ts` if number_format declared, `date.ts` for date format.

### B5 — Language consistency

If `language: id` in BRIEF.md, the `<html lang="…">` attribute in `src/app.html` (or root layout) is `id`. Confirm via `fs_read`.

### B6 — Sapaan consistency

Grep brief's microcopy ✅ column for the **wrong** sapaan given `formality`:

- `formal` / `semi-formal` + `language: id` → must contain `Anda`, must NOT contain `kamu`.
- `casual` + `language: id` → must contain `kamu`, must NOT contain `Anda`.

Fail if mixed.

### B7 — No raw color leaks in BRIEF.md examples

BRIEF.md is read by the agent every session. If its example snippets contain `bg-amber-700` or `text-white`, the agent will copy that pattern. Replace with `bg-primary` / `text-primary-foreground`.

### B8 — First-screen entries valid

Each `first_screens` entry resolves to a real skill name via `list_skills` OR a real block via `list_blocks`. No phantom screens.

### B9 — No emoji in product strings

If `emoji_policy: never`: scan microcopy ✅ column. Zero emoji allowed (even in success row).

### B10 — Self-reference consistent

If `self_reference: "Dombaku"`, microcopy ✅ column never says "kami" / "we". If `self_reference: "kami"`, microcopy never says the product name as a third-person actor.

### B18 — Aesthetic stance committed

`## Aesthetic` populated end-to-end:

- `Direction` is a named extreme (one of the catalog or a custom **name** — not "modern", "clean", "professional", or other AI-default filler).
- `Display font` AND `Body font` declared, neither one is `Inter`, `Roboto`, `Arial`, `system-ui`, or `Space Grotesk` (overused defaults).
- `Memorable detail` is one specific sentence — not "polished interactions" or "smooth transitions".
- `What we are NOT` is one specific rejection — not blank.
- Direction is consistent with `## Identity` audience and `## Visual` palette intent (e.g. a children's product is not `luxury`; a compliance tool is not `maximalist` — unless the brief explicitly justifies it).

If display or body font is one of the banned defaults, halt. The whole point of the stance is to avoid them.

### B19 — Fonts wired in app.css, not per-component

If `## Aesthetic` declares non-default fonts, `fs_read("src/app.css")` must show `@theme { --font-sans: ...; --font-serif: ...; }` (or matching) and a Fontsource / Google Fonts import. Per-component `style="font-family:"` is a fail.

### B20 — Accent override applied

If `## Aesthetic` declares an accent hex/hue distinct from the theme registry default, `src/app.css` must override `--accent` (and `--primary` if needed) under `:root`. The token override is what makes the stance survive across components — declaring it in BRIEF.md without the override is decorative, not load-bearing.

## P1 — should pass

### B11 — Domain glossary ≥3 entries

Or explicit `n/a`.

### B12 — Inspirations captured

`## References` section names 1–3 concrete apps. "Like modern apps" doesn't count.

### B13 — No-go list non-empty

At least 3 don'ts in voice no-go + visual no-go combined.

### B14 — Mono import gated by usage

If `mono_usage: none`: no JetBrains Mono import in `src/app.css`. If `ids-only` or `code-heavy`: import present + `--font-mono` set.

### B15 — Custom marks queued, not authored

`custom_marks` in brief should be a list of names. The SVG files do NOT need to exist yet — they're authored when the first screen needs them. But the names must be present in brief.

### B16 — `must_have_features` ≤7

If 8+, gently push back: "v0.1 has 11 must-haves — trim to 5?"

### B17 — Primary surface matches first screens

`primary_surface: mobile` but `first_screens: [bosia-dashboard]` (web-only)? Flag. Suggest `bosia-mobile-screen` instead.

## Halting failures

If any of B1–B10 or B18–B20 fail, stop. Do not proceed to feature work. Tell the user exactly what's missing:

```
Brief review failed:
- B2: Microcopy "Confirm destructive" row missing ✅ example.
- B6: Sapaan mixed — microcopy success row uses "kamu" but formality is semi-formal.

Resolve these in BRIEF.md (or tell me to fix), then re-run brief review.
```

## Anti-patterns

- Skipping the gate "because the brief looks fine". Run it.
- Auto-fixing P0 fails silently. Always report to user before writing.
- Treating P1 as P0. P1 misses don't halt — they get noted and either fixed cheap or queued.
- Re-running the full intake when a single brief field needs updating. Edit the section, re-run review.

## Output to chat (success case)

One paragraph, identity-first. Example:

> Brief lengkap. **Dombaku** — pencatatan ternak domba untuk peternakan menengah, Bahasa Indonesia semi-formal. Surface utama: mobile. Tema editorial (warm-earthy), primary `#3F6B3A`. First-screen queue: auth + dashboard mobile + CRUD domba. Top 3 fitur: QR scan kalung, riwayat berat, list kawanan. Saya mulai dari auth? Atau langsung dashboard?

Match brief's `language` + `formality`.

## Checklist gate (self)

This skill IS a checklist gate. Its checks are the gate.

## References

- `bosia-brief-intake` — runs this skill at the end.
- `bosia-frontend-design` — the convention that B18–B20 enforce. Stance committed in BRIEF.md § Aesthetic, fonts wired in `app.css`, accent overridden in `:root`.
- `bosia-design-review` — runs at every emit; this skill is the upstream pre-emit gate that ensures `design-review` has constraints to check against.
