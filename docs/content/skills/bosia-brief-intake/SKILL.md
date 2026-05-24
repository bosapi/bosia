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
    stack: []
---

# bosia-brief-intake

## What it captures

A single `BRIEF.md` at app root that downstream skills (`bosia-theme-tokens`, `bosia-design-review`, every page-scaffold skill) read before emitting code. Without it, the agent has to invent identity, palette, and voice every turn — guaranteed to drift.

## When to run

Run **before** any of these:

- First `fs_write` to `src/**`
- `bosia_add_theme`, `bosia_add_block`, `bosia_add`
- Any answer longer than one sentence to "what should I build?"

Skip only if `fs_read("BRIEF.md")` succeeds AND `## Status` line is `complete`.

## Workflow

1. `fs_read("BRIEF.md")` → if missing or `## Status: pending`, enter intake.
2. Greet in user's apparent language. One sentence. No emoji.
3. Walk the four groups **in order**. For each group, read the matching skill body first, then ask its questions.
    1. `read_skill({ name: "bosia-brief-identity" })` — name, tagline, audience, language, formality.
    2. `read_skill({ name: "bosia-brief-voice" })` — tone, emoji/exclamation policy, microcopy spine.
    3. `read_skill({ name: "bosia-brief-visual" })` — palette intent, theme pick, shape, density, type, icons. Runs `bosia_add_theme` at the end.
    4. `read_skill({ name: "bosia-brief-platform" })` — form factors, ID/number/date formats, imagery, first screens. Runs batched `bosia_add_block` at the end.
4. **Lock the aesthetic stance.** `read_skill({ name: "bosia-frontend-design" })` and ask the four stance questions:
    1. **Direction** — pick one extreme from the catalog (or invent one). Show the user `references/aesthetic-directions.md` summary inline. Direction MUST be compatible with the audience locked in step 3.1 and the palette intent locked in step 3.3 — flag and resolve any contradiction.
    2. **Display + body fonts** — distinctive pair, NOT Inter / Roboto / Space Grotesk. Wire later via `app.css` `@theme`.
    3. **Memorable detail** — one named element (staggered headline reveal, custom cursor, grain overlay, oversized footer wordmark, etc.). If user can't name one, the stance isn't locked.
    4. **What we are NOT** — one sentence rejecting the default (e.g. "not a soft purple gradient SaaS landing").
5. `read_skill({ name: "bosia-brief-database" })` and run its question set. Append the `## Database` block to the BRIEF.md draft (between `## Aesthetic` and `## Platform`).
6. `fs_write("BRIEF.md", ...)` with the consolidated answers, including the new `## Aesthetic` and `## Database` sections (templates under `bosia-frontend-design` and `bosia-brief-database`).
7. `read_skill({ name: "bosia-brief-review" })` and walk its checklist (B18 covers the aesthetic stance).
8. Set `## Status: complete` in BRIEF.md.
9. Only now: greet user with a recap and the suggested first build step. The recap MUST name the direction + the memorable detail so the user can confirm.

## Modes

### Quick start (default for users in a hurry)

Ask **six** questions in one turn, infer the rest with named defaults the user can override:

1. Product name + one-sentence promise.
2. Target audience (one sentence).
3. UI language (`id` / `en` / other).
4. Vibe in 2–4 words ("disciplined, warm, agrarian" / "playful, bright, consumer" / "minimal, technical, calm").
5. Palette intent (`warm-earthy` / `cool-tech` / `minimal-mono` / `playful-bright` / `dark-luxury`).
6. Aesthetic direction (`editorial` / `brutally-minimal` / `brutalist` / `retro-futuristic` / `maximalist` / `soft-pastel` / `luxury` / `industrial` / `organic` / `playful` / `art-deco` / custom). Pair this with the vibe — don't blend two directions.
7. Database engine (`postgres` / `mysql` / `sqlite-file` / `sqlite-memory` / `none`). Default `postgres` for multi-user apps; `sqlite-file` for embedded/demo; `none` only for pure marketing pages. `sqlite-memory` flushes on restart — confirm out loud.

Then fill the remaining fields with sensible defaults (see each group skill + `bosia-frontend-design`) and confirm in one block before writing BRIEF.md. The agent proposes a default memorable detail given the direction; user can swap it.

### Deep dive

Walk all four group skills question-by-question. Use when the user explicitly asks ("ajak saya lengkap" / "walk me through it").

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

## Database

- Engine: {postgres | mysql | sqlite-file | sqlite-memory | none}
- DATABASE_URL: {scheme://user:\*\*\*@host:port/db — password masked, real value in .env.local}
- Host: {host or n/a for sqlite}
- Database name: {name or n/a for sqlite}
- ORM: drizzle + Bun built-in driver (Bun.SQL / bun:sqlite)
- Persistence: {yes | no (in-memory)}
- Initial tables: {list or "none yet"}

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

## References

- Inspirations: {1–3 apps/sites this should feel like}
```

## Rules

### R1 — Brief lives at app root, not buried

`BRIEF.md` sits next to `package.json`. Not under `src/`, not in `docs/`. Agent and user both read it.

### R2 — Brief is human-editable

Markdown. Not JSON. User opens, edits, agent re-reads. No round-tripping through DB on every change.

### R3 — Locked decisions

After `## Status: complete`, do NOT silently re-decide palette/theme/formality mid-conversation. If user asks to change, say so explicitly: "Updating brief: formality `formal → semi-formal`. Theme palette unchanged." Then rewrite that section only.

### R4 — Brief beats taste

When agent's defaults conflict with BRIEF.md, BRIEF.md wins. Agent's "I think a blue accent would look great" loses to BRIEF.md's `palette intent: warm-earthy`.

### R5 — Never skip ahead

Don't run `bosia_add_block` before BRIEF.md is `complete`. The block scaffolds copy/structure that drift from brief and cost more to retrofit than to gather upfront.

### R6 — Language locks UI strings

`language: id` means ALL UI strings (button labels, headings, errors) are Indonesian. The agent may still reply to the user in their chat language, but emitted strings follow brief.

### R7 — One BRIEF.md, one app

If user wants a multi-app product, scaffold separate Bosia apps, each with its own brief.

## Anti-patterns

- Asking 30 questions in one turn. Use Quick start.
- Asking yes/no questions with no defaults. Always offer a sane default ("default: `warm-earthy` — type a different one or say `ok`").
- Inventing answers and writing BRIEF.md without user confirmation.
- Treating BRIEF.md as a one-time artifact. It's living — re-read at the start of each chat session.
- Writing BRIEF.md as JSON or YAML. Markdown only.

## Checklist gate

P0:

- [ ] BRIEF.md exists at app root.
- [ ] `## Status: complete` present.
- [ ] Identity, Voice, Visual, **Aesthetic**, Platform sections all populated (no `TBD`).
- [ ] Microcopy spine table has ≥4 rows filled.
- [ ] Theme installed (verify with `fs_list("src/")` for `app.css` having theme tokens).
- [ ] Aesthetic direction named (not "modern, clean, professional") + memorable detail named (one sentence).
- [ ] At least one first-screen block scaffolded, OR user explicitly said "I'll start from scratch".

P1:

- [ ] Domain glossary has ≥3 entries (or explicitly "n/a").
- [ ] Inspirations references captured.
- [ ] No-go list non-empty.

## References

- `references/example-brief.md` — Dombaku-style fully-filled BRIEF.md.
- `references/quick-start-script.md` — exact 6-question opener.
- `bosia-brief-identity`, `bosia-brief-voice`, `bosia-brief-visual`, `bosia-brief-platform`, `bosia-brief-database`, `bosia-frontend-design`, `bosia-brief-review`.
