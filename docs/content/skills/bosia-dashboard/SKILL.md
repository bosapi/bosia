---
name: bosia-dashboard
description: Admin / app dashboard — sidebar nav, top bar, KPI cards, data table, chart panel. Neutral theme. RBAC-driven nav.
triggers:
  - dashboard
  - admin panel
  - app shell
  - sidebar layout
od:
  mode: page-scaffold
  category: admin
bosia:
  design: true
  requires:
    blocks: []
    themes: [neutral]
    components:
      [
        ui/sidebar,
        ui/data-table,
        ui/card,
        ui/chart,
        ui/button,
        ui/avatar,
        ui/separator,
        ui/dropdown-menu,
        ui/badge,
        ui/icon,
        ui/skeleton,
        ui/empty,
      ]
    feats: []
  targets:
    routes:
      - "src/routes/(private)/+layout.svelte"
      - "src/routes/(private)/+layout.server.ts"
      - "src/routes/(private)/dashboard/+page.svelte"
      - "src/routes/(private)/dashboard/+page.server.ts"
  stack: [svelte-5-runes, tailwind-v4, elysia-routes]
---

# bosia-dashboard

## STOP — route placement

All files live under `(private)/`. If `src/routes/(private)/+layout.server.ts` does not exist, **create it** (it must enforce session presence). Never scaffold `dashboard/...` under `(public)/`. See `bosia-routing` R6.

## What it builds

The most complex page-scaffold. A private app shell + a dashboard page demonstrating the standard primitives.

### Files

- `(private)/+layout.svelte` — sidebar + top bar shell. Renders nav from permissions.
- `(private)/+layout.server.ts` — loads user, materialized permissions, nav tree.
- `(private)/dashboard/+page.svelte` — KPI cards + chart + table.
- `(private)/dashboard/+page.server.ts` — `parent()` for user; load KPIs + table data.

## Workflow

1. **Read `BRIEF.md § Aesthetic`.** Dashboards are usually where stance gets the most diluted ("it's an admin tool, just make it functional"). Resist. Apply the locked `Direction` to sidebar style, KPI card weight, and chart palette (e.g. industrial → tabular numerics + square corners + signal-red deltas, editorial → cream surfaces + serif KPI numbers, luxury → restrained chrome + single gold accent on recommended action). Chart series MUST use `chart-1`..`chart-5` semantic tokens; the stance defines those, you don't pick fresh hex per chart. Place the named `Memorable detail` on a high-frequency surface (sidebar wordmark, top-bar greeting, KPI card hover state).
2. `bosia add theme/neutral ui/sidebar ui/data-table ui/card ui/chart ui/button ui/avatar ui/separator ui/dropdown-menu ui/badge ui/icon ui/skeleton ui/empty`.
3. Build `(private)/+layout.server.ts` — loads user + nav.
4. Build `(private)/+layout.svelte` — sidebar (collapsible), top bar (user menu).
5. Build `(private)/dashboard/+page.server.ts` — calls `parent()` for user, loads KPIs + rows. RBAC checks at top.
6. Build `(private)/dashboard/+page.svelte` — KPI grid (4 cards), chart panel, data table.
7. Run all reviews.

## Rules

### Sidebar

- Renders from `data.nav` filtered by `can()`. **Never hardcoded per-role.** See `bosia-rbac-permission`.
- Collapsible (full / icon-only / hidden-mobile).
- Active item: `bg-accent text-accent-foreground`.
- Footer of sidebar: user menu (avatar, name, logout).

### Top bar

- Breadcrumb (`ui/breadcrumb`).
- Search / command trigger.
- User dropdown (`ui/dropdown-menu`).

### KPI cards

- 4 cards in a `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` row.
- Each: label, big number, delta vs. previous period (color: muted, not raw — use `text-emerald-600` ❌, use semantic role).
- For deltas, prefer arrow icons + text label ("+12%") over color alone.

### Chart panel

- `ui/chart` wrapper with a single series first; multi-series only when needed.
- Series colors: `chart-1` … `chart-5` semantic tokens.

### Data table

- `ui/data-table` — sortable, filterable, paginated.
- Row actions in a `ui/dropdown-menu` at the end of the row.
- Empty state covered.

### Page data ≠ layout data

The dashboard page must declare `+page.server.ts` with `await parent()` to read `user` from the layout loader. Do **not** assume `data.user` exists on the page without the parent call. (`bosia-routing` R3.)

## Bosia conventions

- `bosia-routing` — `(private)` group; `+page.server.ts` calls `parent()`.
- `bosia-rbac-permission` — nav rendered from `can()`; no role checks.
- `bosia-theme-tokens` — neutral theme; deltas don't use raw green/red.
- `bosia-empty-states` — table empty + loading + error.
- `bosia-design-review`, `bosia-accessibility-review`.

## Checklist gate

P0:

- [ ] Sidebar rendered from permission-filtered nav (no role checks).
- [ ] `+page.server.ts` calls `parent()` to get `user`.
- [ ] All KPI deltas convey direction with icon + text, not color only.
- [ ] Table covers loading + empty + error states.
- [ ] Mobile: sidebar collapses to sheet, KPIs stack, table scrolls inside container.
- [ ] Active sidebar item visually marked.
- [ ] BRIEF.md § Aesthetic direction applied to sidebar + KPI cards + chart palette (no fresh hex on chart series); memorable detail present on a high-frequency surface.

P1:

- [ ] Top bar breadcrumb reflects route.
- [ ] User dropdown has logout that POSTs to a `+server.ts` (not a link).
- [ ] Chart colors use `chart-*` tokens.
- [ ] Long table virtualizes or paginates ≥ 100 rows.

## References

- `references/design-principles.md`.
- `references/checklist.md`.
- `example.svelte` — layout + dashboard page.
