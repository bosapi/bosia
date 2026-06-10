---
name: bosia-brief-platform
description: Capture platform & data conventions — form factors, primary surface, ID format, number/date locale, imagery strategy, first screens to scaffold, must-have features. Ends by batched `bosia_add_block` for first screens.
triggers:
  - platform
  - mobile
  - desktop
  - id format
  - locale
  - first screens
  - what to build first
od:
  mode: intake
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
  stack: [svelte-5-runes, tailwind-v4]
---

# bosia-brief-platform

## What it captures

Where the app runs, how it formats data, what it scaffolds first.

| Field                  | Purpose                                                                                       |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| `form_factors`         | Which surfaces ship (`mobile`, `tablet`, `web-desktop`, `web-admin`)                          |
| `primary_surface`      | One of the above. Drives breakpoint priorities + nav pattern                                  |
| `id_format`            | Regex + example for domain IDs (`DMB-\d{5}` → `DMB-00142`). Drives mono pill badge component. |
| `number_format`        | Locale + units + decimal places (`id-ID`, `kg` with 1 decimal)                                |
| `date_format`          | Long (`12 Mei 2026`) + compact (`12/05/26`)                                                   |
| `imagery`              | `real-photo` / `illustration` / `glyph` / `none`                                              |
| `placeholder_strategy` | `solid` / `svg-glyph` / `stock`                                                               |
| `first_screens`        | List of page-scaffold skill names to run (`auth`, `dashboard`, `crud`, `landing`)             |
| `must_have_features`   | Free text bullet list of domain features ("QR scan", "weight history chart")                  |

## Why these matter at brief-time

- **Form factors** drive whether to scaffold a `(public)` landing + `(private)` app shell or just `(private)`. Mobile-primary apps get bottom-nav patterns; desktop-primary get sidebar.
- **ID format** is the most-reused string pattern in the app. Locked once, rendered identically in tables, badges, URLs, headings. Mono pill `<IdBadge>` reads format from BRIEF.md.
- **Number/date formats** prevent `12.5.2026` vs `12 Mei 2026` vs `2026-05-12` chaos. Pick once.
- **First screens** scaffold the minimum walking skeleton before any feature work. Without this list, agent will improvise and over-build.
- **Must-have features** keep agent honest about MVP scope. Anything not on this list is "later".

## Questions to ask

1. **Form factors — which surfaces will exist?** Multi-select. `mobile`, `tablet`, `web-desktop`, `web-admin`. `web-admin` = signed-in dashboard for staff/admin; `web-desktop` = consumer-facing on desktop.
2. **Primary surface — which is the daily-use one?** One choice from the above. Determines design priorities (touch-target sizes, nav pattern, photo crop ratios).
3. **ID format — does this domain use entity IDs in UI?** If yes: `prefix-pattern` (e.g. `DMB-\d{5}`) + example (`DMB-00142`). If no: skip and document `id_format: none`.
4. **Number formatting — locale + key unit + decimal places.**
   - Locale: `id-ID`, `en-US`, etc.
   - Primary unit: e.g. `kg` (1 decimal), `USD` (2 decimals), `count` (no decimal)
   - Tabular numerals always on for data — non-negotiable.
5. **Date formatting — long form + compact form.**
   - Long: human-reading (table cells, history) — `12 Mei 2026` / `May 12, 2026`
   - Compact: tight UI (badges, mobile) — `12/05/26` / `5/12/26`
6. **Imagery — does this app show photos?**
   - `real-photo` (catalog, profiles, content): aspect 1:1 or 4:5, `rounded-xl`, `shadow-xs`.
   - `illustration` (marketing, empty states): flat, brand-color, no photo.
   - `glyph` (data-only apps): icon stand-ins in lieu of imagery.
   - `none` (pure data tool): never show imagery.
7. **Placeholder strategy — when image missing?**
   - `solid` (brand soft color + centered glyph),
   - `svg-glyph` (domain-specific mark from `bosia-brief-visual.custom_marks`),
   - `stock` (Unsplash hotlink for prototypes only, replaced for prod).
8. **First screens — what to scaffold today?** Pick from the page-scaffold + flow catalog:
   - `bosia-auth-flow` — login + register (almost always yes for multi-user apps).
   - `bosia-landing` / `bosia-saas-landing` — only if a public marketing surface exists.
   - `bosia-dashboard` — for `web-admin` or `web-desktop` primary.
   - `bosia-mobile-screen` — for `mobile` primary; agent will tailor.
   - `bosia-crud-flow` — bootstraps the first domain resource (sheep, customer, ticket).
   - `bosia-onboarding-flow` — only if user needs first-run setup (rare for internal tools).
9. **Must-have features — bullet list, MVP only.** Push back on >7 items. "Later" is fine.

## Rules

### R1 — Primary surface defines breakpoint priority

`mobile` primary → write all components mobile-first, test mentally at 375px first, desktop is the stretched layer. `web-admin` primary → 1280px first, mobile is a stripped-down companion. Mid-app drift is the most expensive layout bug.

### R2 — ID format is one variable

Define `id_format` regex + `id_format_example`. Components reference these — never hardcode `DMB-` in JSX. Reference in `src/lib/format/id.ts`:

```ts
export const ID_FORMAT = "DMB-\\d{5}"; // from BRIEF.md
export const formatId = (n: number) => `DMB-${String(n).padStart(5, "0")}`;
```

ID badges render `formatId(...)` in mono pill — always the same shape.

### R3 — Number formatting via `Intl`, with tabular numerals

```ts
new Intl.NumberFormat("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(
	45.2,
) + " kg";
```

CSS always: `font-variant-numeric: tabular-nums` on every cell/badge that renders numbers. Skip → numbers shimmy in tables.

### R4 — Dates via `Intl.DateTimeFormat`, two formats

```ts
const LONG = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" });
const COMPACT = new Intl.DateTimeFormat("id-ID", {
	day: "2-digit",
	month: "2-digit",
	year: "2-digit",
});
```

Never `.toLocaleDateString()` ad-hoc. Always one of the two named formatters.

### R5 — Imagery aspect ratios locked

Real-photo app: 1:1 (square) for thumbnails, 4:5 for hero/profile. Don't introduce 16:9 just because a stock image happens to fit it. Crop or replace.

### R6 — First screens cap

Scaffold ≤4 screens upfront. More = analysis paralysis + theme drift before user has touched any of it. Earn each additional screen with user feedback on the first batch.

### R7 — `must_have_features` is small

If user lists 15 features, ask: "Which 3–5 would you ship in a v0.1?" Reorder, mark the rest as `Later` under BRIEF.md.

## Workflow side effects

After answers locked:

1. Write platform fields to BRIEF.md.
2. If `id_format` set: scaffold `src/lib/format/id.ts` with the format constants.
3. If `number_format` set: scaffold `src/lib/format/num.ts`.
4. If `date_format` set: scaffold `src/lib/format/date.ts`.
5. Call `bosia_add` in **batches of 1–3 items** for shared primitives needed by first screens (`ui/button`, `ui/input`, etc.). Never pass ≥4 in a single call — split into multiple `bosia_add` calls. Larger batches blow past the streaming idle window and the user sees "Load failed".
6. Call `bosia_add_block` **one block at a time** for each `first_screens` entry where it maps to a registered block, otherwise mark for in-skill scaffolding (e.g., `bosia-mobile-screen` is a skill not a block). Blocks pull more files than components — never batch blocks.
7. For each first-screen skill: `read_skill({ name })` and follow its workflow.

Confirm the queued additions in a single summary to the user before executing.

## Anti-patterns

- Scaffolding 6+ first screens. Cap at 4.
- Mixing date formats across surfaces. One long, one compact, app-wide.
- Hardcoding `DMB-` in components. Always import from `src/lib/format/id.ts`.
- Using `.toLocaleString()` with default options — non-tabular numerals, locale leakage.
- 16:9 imagery in an app that's everywhere-else 1:1. Consistency over per-image flexibility.
- `must_have_features` that are actually screens. Screens go in `first_screens`. Features describe behavior.
- Skipping `bosia-design-review` after scaffolding first screens. Always run the gate.

## Output to BRIEF.md

Write under `## Platform`:

```markdown
## Platform

- Form factors: mobile (primary), tablet, web-admin
- Primary surface: mobile
- ID format: `DMB-\d{5}` → `DMB-00142` (mono pill badge)
- Number format: id-ID, `kg` with 1 decimal, tabular numerals
- Date format: long `12 Mei 2026` · compact `12/05/26`
- Imagery: real-photo, 1:1 thumbnails / 4:5 hero, rounded-xl
- Placeholder strategy: svg-glyph (custom sheep mark)
- First screens: bosia-auth-flow, bosia-mobile-screen (dashboard), bosia-crud-flow (sheep resource)
- Must-have features:
  - QR scan kalung → catat berat
  - Riwayat berat per domba (chart)
  - List + filter kawanan
  - Add/edit/archive domba

### Later (not in v0.1)

- Multi-staff roles, reports export, push notifications
```

## Checklist gate

P0:

- [ ] `form_factors` non-empty, `primary_surface` is one of them.
- [ ] If domain uses IDs: format regex + example captured AND `src/lib/format/id.ts` scaffolded.
- [ ] Number + date format named functions exist in `src/lib/format/`.
- [ ] First-screen count ≤4.
- [ ] Each `first_screens` entry corresponds to a real catalog skill or block (verified via `list_skills` / `list_blocks`).

P1:

- [ ] Imagery aspect ratios noted; placeholder strategy chosen.
- [ ] `must_have_features` ≤7; rest under `Later`.
- [ ] Tabular numerals applied in scaffolded number cells (manual mental check).

## References

- `bosia-brief-intake` — orchestrator.
- `bosia-brief-visual` — supplies `custom_marks` for svg-glyph placeholders.
- `bosia-landing`, `bosia-dashboard`, `bosia-mobile-screen`, `bosia-auth-flow`, `bosia-crud-flow` — first-screen scaffolds this skill chains into.
