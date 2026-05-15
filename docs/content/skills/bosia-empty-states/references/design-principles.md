# Empty/loading/error — principles

## Lineage

- open-design `skills/frontend-design` — UI-states discipline; "every async branch has four states".
- open-design `skills/ui-skills` — `ui/empty`, `ui/skeleton`, `ui/spinner` as first-class primitives.

## Why this matters

The most common perceived-quality failure in shipping web apps is **the blank screen**:

- API down → blank.
- Zero rows for a new account → blank.
- Filter excluded everything → blank.

Each of these has a correct UI. None of them are "render nothing."

## The four branches

| Branch  | When                             | UI                                       |
| ------- | -------------------------------- | ---------------------------------------- |
| Loading | request in flight                | skeleton sized like final                |
| Empty   | request resolved with zero items | `ui/empty` with icon + copy + action     |
| Error   | request failed                   | `ui/alert variant="destructive"` + retry |
| Content | request resolved with ≥1 item    | render                                   |

A page that handles three of these and forgets the fourth fails when the fourth happens.

## Why skeletons over spinners for primary content

Skeletons:

- preview the layout, no jump on resolve;
- reduce perceived wait;
- communicate "data is coming" without modal anxiety.

Spinners are right for:

- inline actions (button-internal),
- small regions where layout preview isn't useful,
- single-value loads under a second.

## Why empty states need a CTA

An empty state without an action is a dead end. The page knows what the user _should_ do next ("Add your first student"). Saying so converts.

## Error UX

The user does not need:

- the stack trace,
- the SQL,
- the file path.

The user needs:

- "something went wrong",
- a way to try again,
- if persistent, a way to contact support with a correlation id.

The full error belongs in server logs.
