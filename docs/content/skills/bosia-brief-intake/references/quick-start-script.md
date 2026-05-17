# Quick-start opener — exact 6-question script

Use when user is in a hurry. Ask all six in **one** chat turn. Provide each option list inline so the user can answer in a single message. Defaults are named — user can type a number, the option name, or "ok" to accept.

## The script (paste-friendly)

> Halo. Sebelum kita mulai, saya butuh 6 jawaban singkat untuk mengunci product brief (kalau kamu lebih suka Bahasa Inggris, tinggal balas pakai Inggris).
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
> **5. Palette intent — pilih satu.**
>
> - `warm-earthy` — tanah, agraris, hangat.
> - `cool-tech` — disiplin, teknis, biru-abu.
> - `minimal-mono` — hitam-putih, satu aksen.
> - `playful-bright` — saturasi tinggi, konsumer.
> - `dark-luxury` — mode gelap + aksen emas/burgundy.
>
> Default: `warm-earthy`.
>
> **6. Aesthetic direction — pilih satu (boleh ubah belakangan).**
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
> Default: dipilihkan agar cocok dengan palette intent (mis. `warm-earthy` → `editorial`). Tolak default ini secara eksplisit kalau tidak setuju.

## Inference rules (when user answers <6)

If user only answers 1–5 questions, infer the missing ones with named defaults and **confirm in one block** before writing BRIEF.md:

| Missing answer     | Default                                                                             | Confirm prompt                                                               |
| ------------------ | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| 2 (audience)       | Derived from product name + promise                                                 | "Asumsi pengguna: [...]. OK?"                                                |
| 3 (language)       | `id` if user is messaging in Indonesian, else `en`                                  | "Bahasa UI: `id`. OK?"                                                       |
| 4 (vibe)           | Derived from palette intent                                                         | "Vibe: [3 adjectives based on palette]. OK?"                                 |
| 5 (palette intent) | `cool-tech` for B2B/dev tools, `warm-earthy` for consumer, `minimal-mono` otherwise | "Palette: `[default]`. OK?"                                                  |
| 6 (direction)      | Mapped from palette intent (see table below)                                        | "Direction: `[default]`. Memorable detail saya usulkan: [one sentence]. OK?" |

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
- **Don't** silently pick a memorable detail without surfacing it. The user might love or hate "scroll-driven progress bar" — surface it, get a thumbs-up.
- **Don't** accept "modern, clean, professional" as the direction. Push back gently: "`modern, clean, professional` adalah default AI yang ingin kita hindari. Bisa pilih satu dari list, atau jelaskan arah spesifik?"
- **Don't** accept `Inter`, `Roboto`, `Space Grotesk` as the display font if user picks `default-inter` for type. The stance step in intake (`bosia-frontend-design`) will override this with a direction-appropriate pair anyway.

## After answers locked

Run the full intake workflow steps 4–8 (stance commit → BRIEF.md write → review → status complete → recap). Quick-start only collapses the **asking** phase; the writing + review phases are unchanged.
