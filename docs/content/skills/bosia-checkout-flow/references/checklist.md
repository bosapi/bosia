# Checkout — checklist

## P0

- [ ] 4 steps: cart → address → payment → confirmation.
- [ ] Progress + order summary visible on every step.
- [ ] No raw card data hits server — tokenized client-side.
- [ ] Confirm action idempotent (refresh-safe).
- [ ] Payment error UI shows processor-supplied reason.
- [ ] Trust signals on payment (lock, refund, brand logos).
- [ ] Mobile (375px): summary collapses to top; primary action in bottom bar.

## P1

- [ ] Saved addresses / payment methods.
- [ ] Inline validation on postal / address (debounced).
- [ ] Coupon field hidden behind a small "Have a code?" toggle.
- [ ] Confirmation email triggered server-side.
- [ ] Analytics events per step.
- [ ] No surprise fees revealed at payment.
