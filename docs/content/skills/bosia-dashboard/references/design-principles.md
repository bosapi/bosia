# Dashboard — principles

## Lineage

- open-design `skills/frontend-design` — data-density discipline, KPI patterns.
- open-design `skills/ui-skills` — sidebar + data-table composition.
- open-design `skills/digits-fintech-swiss-template` — dense KPI layouts.

## Data density

Dashboards trade whitespace for information. Use:

- Smaller text scale on table rows (14px, tight line-height).
- Padded but not gaped — `p-4` cards, `gap-4` grids.
- Single primary metric per KPI card; secondary metric below in muted text.

But: not at the expense of touch targets on mobile, and not at the expense of contrast.

## Sidebar from permissions

A role-driven sidebar (`if role === 'admin' show X`) is the single most common RBAC anti-pattern. The sidebar is a _data structure_ — a list of items each declaring `{ permission, label, href, icon }`. The renderer filters by `can(item.permission)`. Roles change at runtime; the sidebar code never does. See `bosia-rbac-permission`.

## Deltas without color alone

Up arrow + "+12%" beats green "+12%". Color is reinforcement, not the signal.

For positive/negative emphasis when needed: `text-foreground` for value, `text-muted-foreground` for context. If you must color a delta, use semantic tokens — never raw `text-green-500`.

## Chart series

Stick to `chart-1` through `chart-5` semantic tokens. They:

- meet contrast,
- adapt to theme,
- distinguish without relying on color alone (good legends + direct labels still matter).

## Mobile

The 3-column shell collapses. Sidebar → sheet (`ui/sheet`) triggered from a hamburger. KPI grid stacks. Table either scrolls horizontally inside its container or transforms into per-row cards.
