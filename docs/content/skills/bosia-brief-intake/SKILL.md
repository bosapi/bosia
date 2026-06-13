---
name: bosia-brief-intake
description: First-conversation intake. Capture product identity, voice, visual direction, platform conventions BEFORE any UI emit. Writes BRIEF.md at app root and chains the four bosia-brief-* group skills. Mandatory when BRIEF.md is missing.
triggers:
  - new app
  - first message
  - empty conversation
  - what are we building
  - brief
  - design system
  - start a project
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
      - "src/app.css"
---

# bosia-brief-intake

Capture a single `BRIEF.md` at app root that downstream skills (bosia-theme-tokens, bosia-design-review, every page-scaffold skill) read before emitting code. Without it the agent reinvents identity, palette, and voice every turn — guaranteed drift.

## When to run

Run BEFORE any first `fs_write` to `src/**`, any `bosia_add_theme`/`bosia_add_block`/`bosia_add`, or any multi-sentence answer to "what should I build?". Skip only if `fs_read("BRIEF.md")` succeeds AND `## Status` is `complete`.

## Workflow

1. `fs_read("BRIEF.md")` → if missing or `## Status: pending`, enter intake.
2. Greet in the user's apparent language. One sentence, no emoji.
3. Walk the four groups IN ORDER, reading each skill body first, then asking its questions:
   1. `read_skill bosia-brief-identity` — name, tagline, audience, language, formality.
   2. `read_skill bosia-brief-voice` — tone, emoji/exclamation policy, microcopy spine.
   3. `read_skill bosia-brief-visual` — palette intent, theme pick, shape, density, type, icons. Runs `bosia_add_theme` at the end.
   4. `read_skill bosia-brief-platform` — form factors, ID/number/date formats, imagery, first screens. Runs batched `bosia_add_block` at the end.
4. Lock the aesthetic stance — `read_skill bosia-frontend-design`, then ask four: (a) Direction (one catalog extreme or invent; show `references/aesthetic-directions.md` inline; MUST be compatible with the audience [3.1] and palette intent [3.3] — resolve contradictions); (b) Display + body fonts (distinctive pair, NOT Inter/Roboto/Space Grotesk); (c) Memorable detail (one named element — if the user can't name one, stance isn't locked); (d) What we are NOT (one sentence rejecting the default).
5. Approval gate (tool call, NOT a text question): build the consolidated draft in memory and call `brief_request_approval({ summary })` (recap = identity + aesthetic stance + memorable detail). Host renders a Setuju button. Do NOT `fs_write("BRIEF.md")` yet. On typed corrections, revise and call `brief_request_approval` again.
6. After confirmation (next turn carries "Setuju, tulis BRIEF.md." or `briefApproval: true`), `fs_write("BRIEF.md", ...)` with all sections incl. `## Aesthetic`. Seed `## Todo` with "Redesign login & register pages" (they ship from the template, need reworking).
7. `read_skill bosia-brief-review` and walk its checklist (B18 covers the aesthetic stance).
8. Set `## Status: complete`.
9. Only now: recap to the user + suggested first build step. The recap MUST name the direction + the memorable detail.

> DB engine is NOT collected here — apps default to sqlite-file (`bun:sqlite`). For postgres/mysql/schema work later, load bosia-database-setup.

## Modes

Quick start (default): ask FIVE in one turn, infer the rest with named defaults: (1) name + one-sentence promise; (2) audience; (3) UI language (id/en/other); (4) vibe in 2–4 words; (5) palette intent (warm-earthy/cool-tech/minimal-mono/playful-bright/dark-luxury) AND aesthetic direction (editorial/brutally-minimal/brutalist/retro-futuristic/maximalist/soft-pastel/luxury/industrial/organic/playful/art-deco/custom). Pair direction with the vibe; don't blend two. If the user gives ≥3 of 5 in their opener, INFER the rest from context (chat language → language, tone words → vibe, palette → compatible direction) — do NOT loop back; go straight to the approval gate (step 5). Propose a default memorable detail for the direction; the user can swap it.

Deep dive: walk all four group skills question-by-question. Use when the user asks ("ajak saya lengkap" / "walk me through it").

## BRIEF.md output shape

```markdown
# {Name} — Brief

> {Tagline}

## Status

complete

## Identity

- Name: {…}
- Tagline: {…}
- Audience: {…}
- Language: {id | en | …}
- Formality: {formal | semi-formal | casual}
- Self-reference: {"Dombaku" | "Kami" | "We" | none}

## Voice

- Tone: {2–4 adjectives}
- Reference vibe: {one analogy}
- Emoji in product UI: {never | sparingly | freely}
- Exclamation marks: {never | sparingly | freely}
- Microcopy spine: see table

| Context              | ❌ Avoid | ✅ Use |
| -------------------- | -------- | ------ |
| Empty                | …        | …      |
| Error                | …        | …      |
| Confirm destructive  | …        | …      |
| Success              | …        | …      |
| Primary action label | …        | …      |

- Domain glossary: {term → meaning}
- Copy no-go: {bullet list}

## Visual

- Palette intent: {warm-earthy | cool-tech | minimal-mono | playful-bright | dark-luxury | custom}
- Theme installed: {neutral | editorial | <custom>}
- Brand colors (if custom): {hex list}
- Shape: {sharp 4px | soft 10px | pill}
- Density: {flat | subtle | pronounced}
- Type: {default-inter | serif-editorial | system | custom-pair}
- Mono usage: {none | ids-only | code-heavy}
- Icon set: {lucide | mixed | custom}
- Custom marks needed: {list}

## Aesthetic

- Direction: {brutally-minimal | editorial | brutalist | retro-futuristic | maximalist | soft-pastel | luxury | industrial | organic | playful | art-deco | custom-named}
- Display font: {name + source — NOT Inter / Roboto / Space Grotesk}
- Body font: {name + source}
- Theme base: theme/{neutral | editorial}
- Accent: {hex or named hue — wired as `--accent` in tokens.css}
- Light or dark default: {light | dark}
- Memorable detail: {one sentence — the thing a viewer will remember}
- What we are NOT: {one sentence — the default we are rejecting}

## Platform

- Form factors: {mobile, tablet, web-desktop, web-admin}
- Primary surface: {one of above}
- ID format: {regex + example, e.g. `DMB-\d{5}` → `DMB-00142`}
- Number format: {locale, units, decimal places}
- Date format: {long + compact}
- Imagery: {real-photo | illustration | glyph | none}
- Placeholder strategy: {solid | svg-glyph | stock}
- First screens: {list from registry, e.g. auth, dashboard, crud}
- Must-have features: {bullet list}

## No-go (visual + copy)

- {Anti-patterns from voice + visual groups consolidated}

## Todo

- [ ] Redesign login & register pages — they ship from the template and must be reworked to match this brief's identity + aesthetic.

## References

- Inspirations: {1–3 apps/sites this should feel like}
```

## Rules

R1 — `BRIEF.md` sits at app root (next to `package.json`), not under `src/` or `docs/`.
R2 — Human-editable Markdown, never JSON/YAML. User edits, agent re-reads.
R3 — After `## Status: complete`, don't silently re-decide palette/theme/formality. On a change request, say so ("Updating brief: formality `formal → semi-formal`. Palette unchanged.") and rewrite that section only.
R4 — Brief beats taste: when defaults conflict with BRIEF.md, BRIEF.md wins.
R5 — Never skip ahead: no `bosia_add_block` before `## Status: complete`.
R6 — Language locks UI strings: `language: id` → ALL emitted strings are Indonesian (agent may still reply to the user in their chat language).
R7 — One BRIEF.md per app; multi-app product → separate Bosia apps.

## Anti-patterns

30 questions in one turn (use Quick start) · yes/no questions with no default (always offer one: "default `warm-earthy` — type another or say ok") · follow-ups after the Quick Start batch (infer, then `brief_request_approval`) · asking about the DB engine (sqlite-file default) · ending the recap with a plain-text "Setuju?" instead of calling `brief_request_approval` · `fs_write("BRIEF.md")` before the user confirms · inventing answers without confirmation · treating BRIEF.md as one-time (re-read each session).

## Checklist gate

P0:

- [ ] BRIEF.md exists at app root with `## Status: complete`.
- [ ] Identity, Voice, Visual, **Aesthetic**, Platform all populated (no `TBD`); no `## Database` section.
- [ ] Microcopy spine table ≥4 rows; theme installed (`app.css` has theme tokens).
- [ ] Aesthetic direction named (not "modern, clean, professional") + memorable detail named.
- [ ] ≥1 first-screen block scaffolded, OR user said "I'll start from scratch".

P1:

- [ ] Domain glossary ≥3 entries (or "n/a"); inspirations captured; no-go list non-empty.

## References

`references/example-brief.md` (fully-filled), `references/quick-start-script.md` (5-question opener). Group skills: bosia-brief-identity/-voice/-visual/-platform/-review, bosia-frontend-design, bosia-database-setup (load only on explicit DB request).
