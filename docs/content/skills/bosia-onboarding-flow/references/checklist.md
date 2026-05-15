# Onboarding — checklist

## P0

- [ ] Each step asks one question / one input set.
- [ ] Progress indicator on every step with concrete count ("2 of 4").
- [ ] Back navigation works.
- [ ] Optional steps labeled "Skip for now".
- [ ] Final step redirects to `/dashboard` (or product surface).
- [ ] Mobile (375px): full-screen step, action in bottom bar.

## P1

- [ ] Partial state persists across navigation.
- [ ] Analytics fires per step (start/advance/skip/complete).
- [ ] Reduced motion respected.
- [ ] Auth step reuses `bosia-auth-flow`, not a parallel implementation.
