---
name: bosia-brief-voice
description: Capture product voice — tone adjectives, emoji/exclamation policy, microcopy spine (empty/error/confirm/success/primary-action with ❌✅ pairs), domain glossary, copy no-go. Every string the agent ever writes will be checked against this.
triggers:
  - voice
  - tone
  - copy
  - microcopy
  - emoji policy
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

# bosia-brief-voice

## What it captures

The copy spine. Six fields:

| Field                | Why                                                                           |
| -------------------- | ----------------------------------------------------------------------------- |
| `tone`               | 2–4 adjectives + one reference vibe ("disciplined fintech × warm agrarian")   |
| `emoji_policy`       | `never` / `sparingly` / `freely` (in product UI specifically)                 |
| `exclamation_policy` | `never` / `sparingly` / `freely`                                              |
| `microcopy_spine`    | 5-row ❌✅ table — empty, error, confirm destructive, success, primary action |
| `domain_glossary`    | 3+ terms with locked meaning ("ekor" → unit for sheep; "kawanan" → flock)     |
| `copy_no_go`         | Bullet list of don'ts ("no corporate jargon", "no 'oops'", "no 'awesome'")    |

## Why the microcopy spine

A 5-row ❌✅ table at brief-time prevents 80% of late-stage copy review damage. The agent emits dozens of error/empty/confirm strings across the app — without the spine, each one is a fresh judgment call and inconsistency creeps in by file 5.

## Questions to ask

1. **Tone — pick 2–4 adjectives.** Show a starter menu:
   - `disciplined, calm, technical` (B2B SaaS)
   - `warm, friendly, encouraging` (consumer)
   - `bold, energetic, modern` (marketing-heavy)
   - `quiet, premium, restrained` (luxury / editorial)
   - `playful, bright, casual` (social, gaming)
   - Or freetype.
2. **Reference vibe — "feels like X."** One analogy. `Stripe dashboard for peternakan`, `Notion for plumbers`, `Linear but warmer`.
3. **Emoji in product UI?** `[never | sparingly (empty states only, max 1×) | freely; default: never]`
4. **Exclamation marks?** `[never | sparingly (positive feedback only) | freely; default: sparingly]`
5. **Microcopy spine — fill these five.** Walk through each row. Offer a default based on tone, user accepts or rewrites.
6. **Domain terms — what nouns does this product use that a generic UI wouldn't?** Examples: `ekor` (sheep counter), `kawanan` (flock), `DMB-#####` (sheep ID). Capture at least 3.
7. **Copy no-go — what should we never say?** Show common candidates: "oops", "uh-oh", "awesome", "synergy", "leverage", "amazing", "boom". User picks which to ban + adds any.

## Microcopy spine — template

Fill at intake; agent re-reads on every copy-emitting turn.

| Context                               | ❌ Avoid                       | ✅ Use                                                     |
| ------------------------------------- | ------------------------------ | ---------------------------------------------------------- |
| Empty list ("no items yet")           | "Belum ada apa-apa di sini 😅" | "Belum ada domba terdaftar. Tambahkan domba pertama Anda." |
| Error ("something failed")            | "Ups! Sesuatu telah terjadi."  | "Gagal menyimpan. Periksa koneksi lalu coba lagi."         |
| Confirm destructive ("are you sure?") | "Yakin nih mau hapus?"         | "Hapus DMB-00142? Riwayat berat akan ikut terhapus."       |
| Success ("it worked")                 | "Berhasil banget! 🎉"          | "Berat tersimpan. 45.2 kg pada 12 Mei 2026."               |
| Primary action label                  | "GO!" / "Submit"               | "Simpan" / "Tambah domba"                                  |

For English: same template, defaults shift but spirit holds (e.g., success → "Weight saved. 45.2 kg on May 12, 2026.").

## Rules

### R1 — Verb-led primary actions

Buttons are verbs. `Simpan` / `Tambah domba` / `Mulai scan` — not `Domba baru` / `Berat` / `Form`. English: `Save` / `Add sheep`, never `New` as a standalone label.

### R2 — Specific beats generic

`Foto profil DMB-00142` beats `Foto`. `Hapus DMB-00142?` beats `Hapus item?`. Reach for the named entity in the current context.

### R3 — Data first, decoration second

`45.2 kg` not `Wow, beratnya 45.2 kg!`. Number leads, descriptor (if any) trails.

### R4 — No exclamation in steady state

State labels, headings, button labels, table cells: no `!`. Reserve exclamation for `success` events, and only if `exclamation_policy: sparingly` or `freely`.

### R5 — Destructive confirmations name the thing

`Hapus akun?` is weak. `Hapus akun ardi@…? Semua data terhapus permanen.` is right. Always cite the entity being destroyed.

### R6 — Glossary is a one-way door

Once `domain_glossary` says `ekor` is the sheep counter unit, agent never writes `domba: 142 items` or `sheep: 142 units`. Always `142 ekor`.

### R7 — Voice locks across surfaces

Same tone on landing, app shell, error pages, emails (when added). No "professional landing → playful app" split. If user wants that, document it explicitly as a per-surface override.

## Anti-patterns

- Filling the microcopy table with defaults and skipping past it. The table is the most-read part of BRIEF.md. Force the user through each row.
- "Friendly" as the only tone descriptor — too vague. Push for adjacent words: friendly + warm + clear, or friendly + bold + direct.
- Letting emoji slip into errors. Errors are never the place for `😅`/`🙏`.
- Forgetting domain glossary. Generic apps say `items`; specific apps say `ekor`, `pelanggan`, `tiket`, `member`. Specificity = brand.
- Title Case buttons (`Simpan Domba`). Sentence case always.

## Output to BRIEF.md

Write under `## Voice`:

```markdown
## Voice

- Tone: disciplined, calm, warm, agrarian
- Reference vibe: Stripe dashboard for peternakan
- Emoji in product UI: never
- Exclamation marks: sparingly (success only)

### Microcopy spine

| Context             | ❌ Avoid                       | ✅ Use                                                     |
| ------------------- | ------------------------------ | ---------------------------------------------------------- |
| Empty list          | "Belum ada apa-apa di sini 😅" | "Belum ada domba terdaftar. Tambahkan domba pertama Anda." |
| Error               | "Ups! Sesuatu telah terjadi."  | "Gagal menyimpan. Periksa koneksi lalu coba lagi."         |
| Confirm destructive | "Yakin nih mau hapus?"         | "Hapus DMB-00142? Riwayat berat akan ikut terhapus."       |
| Success             | "Berhasil banget! 🎉"          | "Berat tersimpan. 45.2 kg pada 12 Mei 2026."               |
| Primary action      | "GO!"                          | "Simpan"                                                   |

### Domain glossary

- `ekor` — counter unit for sheep ("142 ekor")
- `kawanan` — flock
- `DMB-#####` — sheep ID, monospace, in green pill badge

### Copy no-go

- No "oops" / "uh-oh"
- No corporate jargon ("sinergi", "optimalisasi", "leverage")
- No exclamation in steady state
- No left-border-color callout cards
```

## Checklist gate

P0:

- [ ] Tone has 2–4 adjectives.
- [ ] Reference vibe is one concrete analogy (not "modern and clean").
- [ ] Emoji + exclamation policies explicit.
- [ ] Microcopy spine table has all 5 rows filled with both ❌ and ✅ examples.
- [ ] Domain glossary has ≥3 entries (or explicit `n/a`).
- [ ] Copy no-go list non-empty.

P1:

- [ ] Microcopy reflects `formality` + `language` from `bosia-brief-identity`.
- [ ] Reference vibe is unfamiliar enough to be useful (not "like Apple").

## References

- `bosia-brief-intake` — orchestrator.
- `bosia-brief-identity` — supplies `language` + `formality` constraints.
- `bosia-design-review` — gate that will reject emoji/exclamation policy violations.
