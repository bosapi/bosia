# Checkout — principles

## Lineage

- open-design `skills/frontend-design` — form-flow discipline.
- open-design `skills/paywall-upgrade-cro` — conversion-rate-optimized purchase UX.
- open-design `skills/marketing-psychology` — trust signals, anchor framing.

## Why 4 steps

Checkout is a chain of decisions. Splitting reduces field count per page, improves error focus, and gives the user a sense of progress. Fewer than 4 (e.g. one giant page) buries errors and feels heavy; more than 4 introduces drop-off.

A common alternative: 3 steps if shipping = billing and there's no separate cart review (already done on the product page).

## Trust at the payment step

This is the moment the user's anxiety peaks. Mitigate with:

- Lock icon and "Secure payment" copy near the card field (concrete reassurance).
- Refund policy link inline (reduces commitment cost).
- Recognized brand logos (Visa, Mastercard, Apple Pay, etc.) — social proof.
- No new fees revealed on this step. Surprise fees here are the single biggest abandonment cause.

## Order summary

Persistent. Always visible. The user must never have to navigate away to remember what they're paying for.

## Confirmation page

Not just "Thank you". Include:

- Order id (copyable).
- Itemized receipt.
- "What happens next" (shipping ETA, license email, etc.).
- Single clear next action (go to dashboard / track order).

## Idempotency

Refreshing the confirmation page must not double-charge. Use an idempotency key passed to the payment processor. Confirmation route reads the key and shows the existing order if it exists.
