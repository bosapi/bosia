# Example BRIEF.md — Dombaku

A fully-filled `BRIEF.md` showing the five sections + § Aesthetic. Use as a reference shape. Real numbers (`max-w-3xl`, `--radius: 10px`, etc.) are illustrative; defer to the group skills for definitive values.

---

```markdown
# Dombaku — Brief

> Pencatatan ternak domba untuk peternak rakyat di Jawa Tengah.

## Status

complete

## Identity

- Name: Dombaku
- Tagline: Catat dombamu, lacak kawananmu.
- Audience: Peternak rakyat 10–200 ekor, smartphone Android entry/mid-tier, sinyal 3G/4G tidak stabil, literasi digital menengah.
- Language: id
- Formality: semi-formal
- Self-reference: Dombaku

## Voice

- Tone: hangat, tenang, disiplin, agraris
- Reference vibe: catatan tani lama yang dijilid rapi — bukan aplikasi POS, bukan dashboard SaaS
- Emoji in product UI: never
- Exclamation marks: sparingly (hanya success state besar)
- Microcopy spine:

| Context              | ❌ Avoid                | ✅ Use                                                             |
| -------------------- | ----------------------- | ------------------------------------------------------------------ |
| Empty                | "Tidak ada data."       | "Belum ada domba tercatat. Mulai dengan +."                        |
| Error                | "Error 500. Coba lagi." | "Gagal menyimpan. Periksa sinyal, lalu coba lagi."                 |
| Confirm destructive  | "Yakin hapus?"          | "Hapus domba DMB-00142 dari kawananmu? Riwayat berat ikut hilang." |
| Success              | "Berhasil!"             | "Tersimpan. Domba DMB-00142 ada di kawanan Utama."                 |
| Primary action label | "Submit"                | "Catat domba"                                                      |

- Domain glossary: kawanan → flock; kalung → ear/neck tag; berat → live weight in kg; sapih → weaning
- Copy no-go: "user", "data", "submit", "OK", "Anda mungkin"

## Visual

- Palette intent: warm-earthy
- Theme installed: editorial (overridden)
- Brand colors: #3F6B3A (primary, moss), #8B5E3C (accent, clay)
- Shape: soft (10px)
- Density: subtle (shadow-xs baseline)
- Type: custom-pair (see § Aesthetic — overridden from default-inter)
- Mono usage: ids-only (JetBrains Mono for `DMB-\d{5}` pills)
- Icon set: lucide + 1 custom (sheep)
- Custom marks needed: sheep (pending author in src/lib/assets/icon-sheep.svg)

## Aesthetic

- Direction: editorial (cream-and-clay, agrarian editorial — closer to a field journal than a SaaS dashboard)
- Display font: Fraunces (Fontsource, variable axis SOFT=50 to soften)
- Body font: Inter Tight (Fontsource)
- Theme base: theme/editorial
- Accent: oklch(from #8B5E3C) — clay, wired as `--accent` in src/app.css
- Light or dark default: light (cream background; dark mode supported but light is the lock screen)
- Memorable detail: a hand-set pull quote on the dashboard greeting that rotates daily from a small seasonal list ("Hari ini, sapih dombamu yang siap.", "Cek berat sebelum hujan turun.", etc.) — set in Fraunces display at large size, slightly italic, asymmetric anchoring left of the KPI grid.
- What we are NOT: not a green/blue tech SaaS landing, not an emoji-heavy consumer app, not a cold logistics admin panel.

## Platform

- Form factors: mobile, web-admin
- Primary surface: mobile
- ID format: `DMB-\d{5}` → DMB-00142 (formatId scaffolded in src/lib/format/id.ts)
- Number format: id-ID locale, weight as `xx,x kg` (one decimal), count as integer
- Date format: long "12 Mei 2026", compact "12/05"
- Imagery: real-photo for hero (sheep, pasture); illustration for empty states
- Placeholder strategy: svg-glyph (sheep mark) on absent photos
- First screens: bosia-auth-flow, bosia-mobile-screen (dashboard mobile), bosia-crud-flow (domba CRUD)
- Must-have features: catat domba, scan QR kalung, riwayat berat, list kawanan, ekspor PDF kawanan (5 — cap is 7)

## No-go (visual + copy)

- "Anda" capitalized (sapaan locked to "kamu" via semi-formal + id — confirmed in B6).
- Emoji in any success / empty / error string.
- Raw color classes — every color goes through tokens.
- Gradients on cards/buttons/headers in app shell (only allowed on marketing hero).
- "Submit", "OK", "Cancel" as button labels.
- Three+ font families (only two locked: Fraunces + Inter Tight + JetBrains Mono numerics is acceptable as 2+1 mono).

## Todo

- [ ] Redesign login & register pages — they ship from the template and must be reworked to match this brief's identity + aesthetic.
- [ ] Replace mock data with real database integration — pages built during the homepage/section flow use placeholder/mock content; wire them to the shop services (Product/Order/Cart) backed by the app's sqlite-file DB.

## References

- Inspirations: The New York Times Cooking (editorial calm), Pinterest Field Notes (agrarian feel), Linear (restraint on chrome — but warmer).
```

---

## Why this example is worth keeping

1. **Voice + Aesthetic agree.** "Field journal" voice → editorial direction → Fraunces + cream. Mismatched stances ("playful direction" + "disciplined voice") would have failed B18 before any code shipped.
2. **Memorable detail is one sentence and specific.** "Hand-set rotating daily pull quote on the dashboard greeting" — a reviewer can verify it exists.
3. **"What we are NOT" rejects three concrete defaults.** Each one is something the AI would have reached for unprompted (tech SaaS, emoji consumer, cold admin).
4. **Brand colors flow into tokens, not classes.** `#3F6B3A` lives in `tokens.css` as `--primary`; the dashboard says `bg-primary`. Theme swap = override the variable, code stays untouched.
5. **First screens resolve to real skills.** `bosia-auth-flow`, `bosia-mobile-screen`, `bosia-crud-flow` all exist in the catalog — B8 passes.
6. **5 must-have features.** Under the 7 cap. B16 passes.

## How the agent uses this file

When entering intake, after greeting in the user's language, the agent MAY paste the corresponding section's shape (not the Dombaku content) as a fill-in template. Never paste Dombaku-specific values as defaults for a different product.
