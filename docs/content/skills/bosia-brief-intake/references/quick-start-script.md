# Quick-start opener — exact 5-question script

Use when user is in a hurry. Ask all five in **one** chat turn. Provide each option list inline so the user can answer in a single message. Defaults are named — user can type a number, the option name, or "ok" to accept.

> Database engine is NOT asked. Default = sqlite-file. Load `bosia-database-setup` later only if the user asks for postgres / mysql / schema work.

## The script (paste-friendly)

> Halo. Sebelum mulai, saya butuh 5 jawaban singkat untuk mengunci product brief (kalau lebih suka Bahasa Inggris, balas pakai Inggris saja).
>
> **1. Nama produk + satu kalimat janjinya.**
> Contoh: "Dombaku — pencatatan ternak domba untuk peternak kecil di Jawa Tengah."
>
> **2. Siapa pengguna utamanya?** (satu kalimat)
> Contoh: "Peternak rakyat 10–200 ekor, smartphone Android, sinyal tidak stabil."
>
> **3. Bahasa UI?** `id` / `en` / lain.
> Default: `id`. Bahasa chat boleh beda dari bahasa UI.
>
> **4. Vibe dalam 2–4 kata.**
> Contoh: "disciplined, warm, agrarian" / "playful, bright, consumer" / "minimal, technical, calm".
>
> **5. Palette intent + aesthetic direction (satu paket).**
>
> Palette:
>
> - `warm-earthy` — tanah, agraris, hangat.
> - `cool-tech` — disiplin, teknis, biru-abu.
> - `minimal-mono` — hitam-putih, satu aksen.
> - `playful-bright` — saturasi tinggi, konsumer.
> - `dark-luxury` — mode gelap + aksen emas/burgundy.
>
> Direction (pilih satu yang cocok dengan palette):
>
> - `editorial` — serif display, asymmetric grid, generous leading.
> - `brutally-minimal` — mono palette, oversized type, near-zero motion.
> - `brutalist` — system mono, visible grid lines, square corners.
> - `retro-futuristic` — 70s/80s palette, CRT scanline overlay, mono display.
> - `maximalist` — overlapping layers, multi-family type, dense color.
> - `soft-pastel` — low-saturation, rounded corners, soft shadows.
> - `luxury` — cream + charcoal + single sharp accent, restrained motion.
> - `industrial` — desaturated grays, dense data tables, mono numerics.
> - `organic` — earth tones, hand-drawn accents, irregular shapes.
> - `playful` — oversaturated primaries, bouncy easing, rounded everything.
> - `art-deco` — symmetric layouts, geometric ornaments, tall narrow type.
> - Atau nama sendiri kalau punya arah spesifik.
>
> Default: `warm-earthy` + `editorial` (palette intent maps to direction — see table below). Tolak default ini secara eksplisit kalau tidak setuju.

## Inference rules (when user answers <5)

If user only answers 1–4 questions, infer the missing ones with named defaults and **call `brief_request_approval`** with the consolidated draft. Do NOT loop back with follow-up questions.

| Missing answer        | Default                                                                             | Recap line                                                                                 |
| --------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 2 (audience)          | Derived from product name + promise                                                 | "Pengguna: [...]."                                                                         |
| 3 (language)          | `id` if user is messaging in Indonesian, else `en`                                  | "Bahasa UI: `id`."                                                                         |
| 4 (vibe)              | Derived from palette intent                                                         | "Vibe: [3 adjectives based on palette]."                                                   |
| 5 (palette/direction) | `cool-tech` + `industrial` for B2B/dev tools; `warm-earthy` + `editorial` otherwise | "Palette: `[default]`. Direction: `[default]`. Memorable detail saya usulkan: [sentence]." |

### Palette intent → default direction

| Palette intent   | Default direction  | Why                                                             |
| ---------------- | ------------------ | --------------------------------------------------------------- |
| `warm-earthy`    | `editorial`        | Serif + cream pairs naturally with warm primaries.              |
| `cool-tech`      | `industrial`       | Disciplined + tabular = cool-tech baseline.                     |
| `minimal-mono`   | `brutally-minimal` | Mono palette is already half the stance.                        |
| `playful-bright` | `playful`          | Saturation calls for bouncy easing + rounded everything.        |
| `dark-luxury`    | `luxury`           | Cream/charcoal + restrained accent fits dark-mode luxury reads. |
| `custom`         | (ask)              | Don't infer; ask for direction explicitly.                      |

## What NOT to do in quick-start

- **Don't** ask the four group skills' deep questions in this turn. Quick-start is intentionally shallow; deep dive runs separately when user asks for it.
- **Don't** ask follow-up questions after the user answers (or skips) the batch. Infer + call `brief_request_approval`. The host UI gives the user a **Setuju** button or they type corrections — both paths are fine.
- **Don't** ask the user about the database engine. Default = sqlite-file. Load `bosia-database-setup` only on explicit user request ("pakai postgres", "set up database", etc.).
- **Don't** silently pick a memorable detail without surfacing it in the approval summary. Pass it to `brief_request_approval({ summary })`.
- **Don't** accept "modern, clean, professional" as the direction. Push back gently: "`modern, clean, professional` adalah default AI yang ingin kita hindari. Bisa pilih satu dari list, atau jelaskan arah spesifik?"
- **Don't** accept `Inter`, `Roboto`, `Space Grotesk` as the display font if user picks `default-inter` for type. The stance step in intake (`bosia-frontend-design`) will override this with a direction-appropriate pair anyway.
- **Don't** end the recap with a plain-text "Setuju?" question. Use the `brief_request_approval` tool call — the host UI renders the **Setuju** button from it.

## After answers locked

Run workflow steps 4–8 (stance commit → `brief_request_approval` → wait for Setuju → BRIEF.md write → review → status complete → recap). Quick-start only collapses the **asking** phase; the approval gate + writing + review phases are unchanged.
