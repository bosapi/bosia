# A11y principles — lineage

## Sources

- WCAG 2.1 AA — the contract our P0 checks descend from.
- open-design `skills/frontend-design` — pragmatic a11y rules embedded in production-UI discipline.
- open-design `skills/ui-skills` — the registry primitives that carry a11y for free.

## Why "native HTML first"

ARIA does not add semantics that a native element already carries — it _replaces_ them. A `<button>` announces as a button, takes focus, fires on Space/Enter, and inherits keyboard semantics. A `<div role="button">` announces as a button **and that's it** — you still have to wire focus, key handlers, and disabled state.

Rule: if a native element can do it, use the native element.

## Why semantic-token contrast is automatic

Token pairs (`text-foreground` on `bg-background`, `text-card-foreground` on `bg-card`) are designed to meet WCAG AA. As long as you stay in the token vocabulary, contrast is a non-issue. Step outside (`text-zinc-400 on bg-white`) and you own the contrast math yourself.

## Why dialogs/popovers must be registry items

Focus trapping + Escape + restoration are easy to write **almost correctly**, and almost-correct is worse than wrong because it passes manual review and breaks for assistive tech. Registry items get this right once and we reuse.

## What this skill does not cover

- Internationalization (RTL, locale-specific keyboard maps) — handled by `ui/direction` and broader i18n discipline.
- Screen-reader UX testing — out of scope for a static review; requires real assistive-tech runs.
