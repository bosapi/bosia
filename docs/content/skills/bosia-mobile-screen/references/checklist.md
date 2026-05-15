# Mobile screen — checklist

## P0

- [ ] Page wrapper uses `h-svh` (not `h-screen`).
- [ ] Bottom-anchored bars apply `env(safe-area-inset-bottom)`.
- [ ] Top fixed bars apply `env(safe-area-inset-top)`.
- [ ] All inputs `text-base` (16px).
- [ ] All taps ≥ 44×44 (use `min-h-11`).
- [ ] No horizontal scroll at 375px.

## P1

- [ ] Primary action lives in the bottom action bar.
- [ ] Transient flows use bottom-anchored dialog (or `ui/sheet` when registry adds it).
- [ ] Sticky header collapses or shrinks on scroll for content density.
- [ ] Pull-to-refresh disabled if it conflicts with in-app refresh.
