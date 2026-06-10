---
name: bosia-empty-states
description: Async UI must cover loading + empty + error. Use `ui/skeleton` for loading, `ui/empty` for no-data, error boundary for failure. Never blank screen on async.
triggers:
  - empty state
  - loading state
  - error state
  - skeleton
  - no data
  - placeholder
  - empty list
od:
  mode: composition
  category: design
bosia:
  design: true
  requires:
    blocks: []
    themes: []
    components: [ui/empty, ui/skeleton, ui/spinner, ui/alert]
    feats: []
  targets:
    routes: []
  stack: [svelte-5-runes, tailwind-v4]
---

# bosia-empty-states

## What it builds

Every async data branch in a Bosia page renders one of: loading, empty, error, or content. Blank screens on failure are an automatic P0 violation.

## When to use

Any view that depends on async data — server loader output, client fetch, paginated lists, search results, filters that may return zero rows.

## The contract

For any reactive list/value backed by async data:

```
state(loading)  → <Skeleton …>
state(empty)    → <Empty …> (icon + headline + body + primary action)
state(error)    → <Alert variant="destructive"> + retry
state(content)  → render
```

Skip none. The "zero rows" branch is the most often forgotten.

## Required registry items

- `ui/skeleton` — loading placeholders shaped like final content.
- `ui/empty` — "no data" UI with icon + message + action slots.
- `ui/spinner` — for inline loaders inside buttons / small areas.
- `ui/alert` (variant `destructive`) — for error rendering.

Install:

```bash
bosia add ui/empty ui/skeleton ui/spinner ui/alert
```

## Pattern — list view

See `example.svelte` for the canonical implementation.

## Empty-state copy rules

- One-line headline that names the absence (e.g. "No students yet").
- One sentence of context (e.g. "Add your first student to start tracking attendance.").
- A primary action button.
- Optional: secondary "Learn more" link.

"No results" alone is failure.

## Error-state rules

- Never expose stack traces / SQL / file paths.
- Show: short headline, human-friendly message, retry button.
- Log the full error server-side with a correlation id; surface only the id to the user.

## Loading-state rules

- Skeletons match the final layout shape so there's no jump on resolve.
- For sub-second loaders, prefer no skeleton over a flashing one (debounce 150ms).

## Checklist gate

P0:

- [ ] Every `await` / fetched value renders all four branches.
- [ ] Empty state has headline + body + action.
- [ ] Error state has retry and no raw error leakage.
- [ ] Skeleton dimensions approximate final content.

P1:

- [ ] Loading state debounced for sub-second fetches.
- [ ] `aria-live="polite"` on the region that swaps states (for screen readers).
- [ ] Retry uses optimistic update where possible.

## References

- `references/design-principles.md` — why blank screens are the #1 perceived-quality killer.
- `example.svelte` — canonical list view with all four branches.
