---
name: bosia-checkout-flow
description: Cart → address → payment → confirmation. Progress per step. Trust signals (lock, refund, secure-pay icons). Order summary persistent.
triggers:
    - checkout
    - cart to payment
    - purchase flow
    - buy flow
od:
    mode: flow
    category: commerce
bosia:
    design: true
    requires:
        blocks: []
        themes: [editorial]
        components:
            [
                ui/progress,
                ui/form,
                ui/field,
                ui/input,
                ui/card,
                ui/separator,
                ui/button,
                ui/badge,
                ui/alert,
                ui/radio-group,
            ]
        feats: []
    targets:
        routes:
            - "src/routes/checkout/+layout.svelte"
            - "src/routes/checkout/cart/+page.svelte"
            - "src/routes/checkout/address/+page.svelte"
            - "src/routes/checkout/address/+page.server.ts"
            - "src/routes/checkout/payment/+page.svelte"
            - "src/routes/checkout/payment/+page.server.ts"
            - "src/routes/checkout/confirmation/+page.svelte"
    stack: [svelte-5-runes, tailwind-v4, elysia-routes]
---

# bosia-checkout-flow

## What it builds

A 4-step checkout under `/checkout`:

1. **Cart** — line items + total. Edit qty, remove. Continue.
2. **Address** — shipping/billing form. Validate.
3. **Payment** — payment method + payment fields. Validate. Trust signals visible.
4. **Confirmation** — order ID, receipt, next-step CTA.

`+layout.svelte` holds the progress bar + persistent order summary.

## Workflow

1. `bosia add theme/editorial ui/progress ui/form ui/field ui/input ui/card ui/separator ui/button ui/badge ui/alert ui/radio-group`.
2. Layout: 2-column on desktop (form + summary), stacked on mobile (summary collapses to top bar).
3. Each step's `+page.server.ts` validates + saves partial state; the next step loads it.
4. Payment integrates with the payment processor (Stripe/etc.) — never store raw card data; tokenize client-side.
5. Confirmation page is the only step without a "next" button — it has a "go to dashboard" or "view order".

## Rules

### R1 — Progress always visible

`ui/progress` at the top: "Cart → Address → Payment → Done". Steps numbered or labeled.

### R2 — Order summary persistent

Right-column (desktop) or top-collapsed (mobile). User must always see what they're paying for and the total.

### R3 — Trust signals on payment

- Lock icon + "Secure payment" near the card field.
- Refund policy link.
- Recognized payment-method logos.
- No surprise fees post-payment.

### R4 — Validate every field at the boundary

Address: postal, country, required fields. Payment: card processor tokenizes; server never sees PAN.

### R5 — Idempotent submission

Confirm action is idempotent — refresh of the confirmation page must not double-charge. Use an idempotency key per checkout session.

### R6 — Errors are clear, not generic

Payment declined → show _why_ (insufficient funds / expired / wrong CVV) when the processor tells you. Don't say "payment failed" only.

### R7 — Mobile-first

Bottom action bar for "Continue" / "Pay". Each step full-screen on mobile.

## Bosia conventions

- `bosia-routing` — checkout under root (not `(public)` because logged-in checkout is common). Layout for shared shell.
- `bosia-svelte-runes` — cross-step state in `lib/stores/checkout.svelte.ts`.
- `bosia-rbac-permission` — checkout typically authenticated; if guest checkout supported, gate the right routes.
- `bosia-empty-states` — empty cart state.
- `bosia-security-review` — mandatory before launch.

## Checklist gate

P0:

- [ ] Progress visible at every step.
- [ ] Order summary visible at every step.
- [ ] No raw card data ever hits the server.
- [ ] Confirm action is idempotent (re-submit safe).
- [ ] Payment errors show specific reason from the processor.
- [ ] Trust signals visible on the payment step.
- [ ] Mobile (375px): summary collapses to top; primary action in bottom bar.
- [ ] `bosia-security-review` pass.

P1:

- [ ] Saved addresses / payment methods reduce typing on return.
- [ ] Inline validation (debounced) on address/postal.
- [ ] "Apply coupon" UI is non-prominent (so non-coupon users don't bounce to search for codes).
- [ ] Confirmation email triggered server-side, not client.

## References

- `references/design-principles.md` — checkout UX research.
- `references/checklist.md`.
