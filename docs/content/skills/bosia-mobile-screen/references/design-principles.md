# Mobile screen — principles

## Lineage

- open-design `skills/frontend-design` — touch-target sizing, thumb-reach zones.
- open-design `skills/apple-hig` — iOS-specific safe-area + sheet patterns.

## Thumb zone

The bottom third of the screen is the reachable zone for one-handed use. Primary actions belong there. Top of screen is for context (back, title), not actions.

## Why `h-svh` over `h-screen`

`h-screen` uses `100vh`, which on iOS Safari includes the browser chrome that disappears on scroll — content gets clipped. `h-svh` uses the small viewport height, which is stable.

## Why bottom-anchored surfaces beat centered dialogs

A centered dialog requires reaching to the middle of the screen and a precise tap on a Close button. A bottom-anchored surface drops in from the thumb zone, dismisses with a swipe, and doesn't crowd the content above. Until the registry ships a dedicated `ui/sheet`, achieve the pattern by bottom-anchoring `ui/dialog`.

## Touch target sizing

44×44 (iOS HIG) / 48dp (Material) is the floor. The visible button may look smaller, but the hit area must reach 44.

## Input zoom guard

Set `font-size: 16px` (= `text-base`) on focusable inputs. iOS Safari zooms when font is smaller, breaking layout.
