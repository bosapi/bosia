# Aesthetic directions — starter catalog

Eleven starter directions. Pick one. Or invent one true to the brief. **Don't blend.**

Each entry: palette stance, type pairing, motion temperament, signature detail. Use as a launchpad, not a script.

---

## 1. Brutally minimal

- **Palette**: monochrome — `--background` near-white or near-black, `--foreground` opposite, single 5% accent (signal red, electric blue).
- **Type**: one face only. `Inter Tight`, `Söhne`, or `Geist` at oversized scales (h1 at 96px+).
- **Motion**: almost none. A 200ms opacity fade on page load. No hovers beyond underline.
- **Layout**: massive whitespace. Single column. Asymmetric anchoring (text flush left, image flush right).
- **Signature**: oversized wordmark in the footer that runs edge-to-edge.

---

## 2. Editorial / magazine

- **Palette**: cream `--background`, ink `--foreground`, single warm accent (saffron, terracotta).
- **Type**: serif display (`Fraunces`, `Cormorant Garamond`, `Newsreader`) + refined sans body (`Inter Tight`, `Söhne`).
- **Motion**: generous easing on image reveals. Pull-quote fades on scroll.
- **Layout**: asymmetric grid with overlap. Drop caps. Wide leading. Pull quotes break the column.
- **Signature**: a hand-set pull quote that overlaps the lead image.

---

## 3. Brutalist / raw

- **Palette**: paper white + black. One bright "warning" accent (caution yellow, hazard orange).
- **Type**: system mono everywhere (`Departure Mono`, `JetBrains Mono`, `IBM Plex Mono`). No hierarchy via weight — only via size.
- **Motion**: zero. Or jarring (instant snaps, no easing).
- **Layout**: visible grid lines. Hairline borders on everything. Unstyled-looking inputs (square corners, 1px borders).
- **Signature**: a sticky banner with raw timestamp + build hash.

---

## 4. Retro-futuristic

- **Palette**: amber + teal + magenta on near-black. Or beige + brown + burnt orange (70s).
- **Type**: pixel / CRT display (`VT323`, `Major Mono Display`, `Press Start 2P`) + mono body (`IBM Plex Mono`).
- **Motion**: scanline flicker overlay. Cursor blink on inputs. Phosphor-glow on hover.
- **Layout**: terminal-like — bordered panels, ASCII dividers, tabular alignment.
- **Signature**: CRT scanline + chromatic aberration on the hero text.

---

## 5. Maximalist / chaotic

- **Palette**: 5+ saturated colors, deliberately clashing (electric pink + lime + cobalt).
- **Type**: 2–3 display faces mixed (`Boldonse`, `Caprasimo`, `Honk`) + neutral body (`DM Sans`).
- **Motion**: bouncy easing, marquee tickers, infinite scroll backgrounds, animated stickers.
- **Layout**: layered overlap, rotated cards, sticker-like badges, no obvious grid.
- **Signature**: a giant rotated wordmark that spans diagonally across the hero.

---

## 6. Soft / pastel

- **Palette**: low-saturation pinks, peaches, lavenders. Off-white background. Single deeper accent for CTAs.
- **Type**: warm serif (`Fraunces` variable axis, soft) + friendly sans (`Plus Jakarta Sans`, `Quicksand`).
- **Motion**: slow soft easing (700ms+ on reveals). Gentle scale on hover.
- **Layout**: generous rounded corners (radius xl+). Soft drop shadows. Centered compositions.
- **Signature**: a hand-drawn squiggle underline beneath the headline verb.

---

## 7. Luxury / refined

- **Palette**: cream + charcoal. Single accent — gold, deep burgundy, or forest. High contrast.
- **Type**: wide-tracking sans (`Tenor Sans`, `Cormorant SC`) display + understated sans (`Inter Tight`, `Söhne`) body.
- **Motion**: micro — 150ms tightly eased fade-ins. Nothing dramatic.
- **Layout**: symmetric. Generous margins. Restrained color blocks. Centered hero.
- **Signature**: a hairline gold rule beneath section headers, gold foil hover on the primary CTA.

---

## 8. Industrial / utilitarian

- **Palette**: desaturated grays + single signal color (signal red, caution yellow).
- **Type**: condensed sans (`Bahnschrift`, `Roboto Condensed`) headers + tabular mono (`IBM Plex Mono`) for numerics.
- **Motion**: none. State changes are instant.
- **Layout**: dense data tables, square corners, fixed-width columns, minimal chrome, no decorative gaps.
- **Signature**: a top-of-page system bar with environment, build, and uptime.

---

## 9. Organic / natural

- **Palette**: earth tones — clay, moss, ochre, bone.
- **Type**: humanist serif (`Cormorant`, `Lora`) + handwritten accent (`Caveat`, `Reenie Beanie`).
- **Motion**: slow, organic easing. Leaf-fall transitions. Hover wobble.
- **Layout**: irregular shapes, hand-drawn dividers, asymmetric crops, generous whitespace.
- **Signature**: a hand-drawn botanical illustration as the brand mark.

---

## 10. Playful / toy-like

- **Palette**: oversaturated primaries — Crayola red, sky blue, lemon yellow.
- **Type**: rounded display (`Caprasimo`, `Bungee`, `Lilita One`) + chunky body (`Nunito`, `Fredoka`).
- **Motion**: bouncy spring easing on every hover. Big scale jumps. Wiggle on click.
- **Layout**: rounded-everything (radius 2xl+). Big icons. Friendly mascots. Stickers.
- **Signature**: a mascot that follows cursor position in the hero.

---

## 11. Art deco / geometric

- **Palette**: black + cream + gold. Or jade + black + ivory.
- **Type**: tall narrow display (`Tenor Sans`, `Limelight`, `Poiret One`) + classical body (`Cormorant`).
- **Motion**: symmetric reveals from center. Mirrored fades.
- **Layout**: strict symmetry. Geometric ornaments (sunbursts, chevrons). Tall narrow columns.
- **Signature**: an art-deco sunburst ornament framing the page title.

---

## Choosing rules

1. **Serve the audience and voice from BRIEF.md.** A children's app is not luxury. A compliance tool is not maximalist. (Unless that's the point — then own it.)
2. **One direction. Not two-and-a-half.** Editorial + brutalist is just confused.
3. **Vary across sessions.** If the last app was editorial-cream, the next shouldn't also be editorial-cream by default.
4. **Light or dark is part of the stance.** Don't default to dark mode because it "looks designed".
5. **If you invent a custom direction, name it.** "Folk-tech terminal" or "soft-brutalism" — a name forces commitment.

## How to translate a direction into Bosia tokens

Each direction maps onto Bosia's semantic token slots:

| Direction stance | `--background` | `--foreground` | `--primary`     | `--accent`           | `--radius` |
| ---------------- | -------------- | -------------- | --------------- | -------------------- | ---------- |
| Brutally minimal | near-white     | near-black     | foreground      | single saturated     | sm         |
| Editorial        | cream          | ink            | foreground      | saffron / terracotta | md         |
| Brutalist        | paper white    | black          | foreground      | caution yellow       | none       |
| Retro-futuristic | near-black     | amber          | magenta         | teal                 | none       |
| Maximalist       | white or color | ink            | electric pink   | lime / cobalt        | md         |
| Soft pastel      | off-white      | warm dark      | deeper rose     | lavender             | xl         |
| Luxury           | cream          | charcoal       | gold / burgundy | same as primary      | sm         |
| Industrial       | gray-50        | gray-900       | signal red      | caution yellow       | none       |
| Organic          | bone           | clay-dark      | moss            | ochre                | lg         |
| Playful          | white          | ink            | Crayola red     | sky blue             | 2xl        |
| Art deco         | black          | cream          | gold            | jade                 | none       |

Override `tokens.css` after `bosia add theme/<base>`. Don't write per-component overrides.
