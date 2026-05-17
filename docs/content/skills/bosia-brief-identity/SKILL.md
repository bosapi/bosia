---
name: bosia-brief-identity
description: Capture product identity — name, tagline, audience, language, formality, self-reference noun. Locks decisions every later skill depends on (UI string language, "Anda" vs "kamu", sentence case).
triggers:
    - identity
    - audience
    - language
    - formality
    - tagline
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
    stack: []
---

# bosia-brief-identity

## What it captures

Six fields that every later skill reads:

| Field            | Purpose                                                           | Example                                              |
| ---------------- | ----------------------------------------------------------------- | ---------------------------------------------------- |
| `name`           | Display + window title + auth screens                             | `Dombaku`                                            |
| `tagline`        | One promise. Used as hero subhead + meta description              | `Pencatatan ternak domba untuk peternakan menengah.` |
| `audience`       | Who uses this. Drives complexity, jargon level, mobile-vs-desktop | `Admin/staff peternakan dengan beberapa kandang.`    |
| `language`       | UI string language. **Not** the chat language.                    | `id`                                                 |
| `formality`      | Sentence case, sapaan, copy temperature                           | `semi-formal`                                        |
| `self_reference` | How the app refers to itself in copy                              | `"Dombaku"` (not "kami")                             |

## Why these matter

- **Name + tagline** show up on day-1 in `<title>`, login screen, empty states. Getting them wrong forces a rename pass across 20+ files.
- **Language** locks UI strings. `language: id` means buttons say `Simpan`, not `Save`. The agent may keep replying in English in chat — but emitted code is Indonesian.
- **Formality** decides the sapaan: `formal → "Anda"`, `casual → "kamu"`, `semi-formal → "Anda" but warmer copy`. Mid-app drift between "Anda" and "kamu" is the single most common copy bug.
- **Self-reference** decides whether the app talks as `"{Name}"` (third-person, more dignified) or `"kami" / "we"` (first-person, warmer). Pick once.

## Questions to ask

In order. Show the default in `[brackets]`. User can override or accept.

1. **Name?** `[required]`
2. **One-line promise — what does it do, for whom?** `[required]`
3. **Who uses this day-to-day?** `[1–2 sentences]`
4. **UI language?** `[en | id | <other ISO code>; default: detect from user's chat language]`
5. **Formality?** `[formal | semi-formal | casual; default: semi-formal]`
    - `formal` → "Anda" / "you" with full grammar, no contractions
    - `semi-formal` → "Anda" / "you" but warmer, contractions allowed in English, sentence case
    - `casual` → "kamu" / "you" with contractions, plain language
6. **How should the app refer to itself in copy?** `["{Name}" | "kami" / "we" | none; default: "{Name}" when name is short, "kami"/"we" otherwise]`

## Decisions this locks

After identity is captured, the following are **non-negotiable** for the rest of the session:

| Decision                  | Locked because                                                                                 |
| ------------------------- | ---------------------------------------------------------------------------------------------- |
| Casing in UI strings      | Sentence case always (Bosia convention). Title Case forbidden regardless of formality.         |
| Sapaan                    | `formal`/`semi-formal` → "Anda" / "you". `casual` → "kamu" / "you". Never mix in same surface. |
| Self-reference word       | Pick one, use it everywhere. Never alternate "Dombaku" and "kami" in the same flow.            |
| Auth-screen copy language | Matches `language`. No "Welcome back!" in an `id` app.                                         |

## Rules

### R1 — Sentence case, always

Even `formal` apps. "Simpan domba", not "Simpan Domba". "Add sheep", not "Add Sheep". Exception: technical abbreviations (QR, ID, KG, URL).

### R2 — No mixed sapaan

If `formality: semi-formal` and `language: id`, every "you" in product UI is "Anda". Find any "kamu" → bug. Same in English: stick to "you" (never "u", never "ya'll").

### R3 — Name short enough for buttons

If name > 12 chars, suggest a shortform for auth screens and toolbar. `Dombaku Peternakan Modern Indonesia` → use `Dombaku` in chrome, full name only on landing hero.

### R4 — Tagline ≤ 12 words

If user gives a paragraph, summarize to ≤12 words and confirm. Hero subhead, meta description, OG card all use this exact string.

### R5 — Audience drives default platform

Solo founder / individual users → mobile-first. Team / multi-staff → web-admin + mobile companion. Note for `bosia-brief-platform` to inherit.

## Anti-patterns

- "We help you optimize your synergy" — corporate filler. Reject and ask for a concrete verb.
- Asking "what's your brand voice?" before identity is set. Voice comes next, not now.
- Defaulting `language: en` for users chatting in Indonesian. Detect and default to `id`.
- Naming the app something the user typed as a placeholder ("My App", "Untitled"). Push back once: "Lock in `My App` or rename now?"
- Emoji in tagline. Tagline is meta-description fodder — has to render flat in SERPs.

## Output to BRIEF.md

Write under `## Identity`:

```markdown
## Identity

- Name: Dombaku
- Tagline: Pencatatan ternak domba untuk peternakan menengah.
- Audience: Admin/staff peternakan dengan beberapa kandang yang butuh disiplin data harian.
- Language: id
- Formality: semi-formal
- Self-reference: "Dombaku"
```

## Checklist gate

P0:

- [ ] All six fields populated, none `TBD`.
- [ ] Tagline ≤ 12 words.
- [ ] Name has a short-form noted if > 12 chars.
- [ ] Sapaan choice consistent with `formality` + `language`.

## References

- `bosia-brief-intake` — orchestrator that calls this skill.
- `bosia-brief-voice` — runs after this, inherits `formality` + `language`.
