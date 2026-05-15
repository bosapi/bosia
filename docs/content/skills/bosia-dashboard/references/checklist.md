# Dashboard — checklist

## P0

- [ ] Sidebar rendered from permission-filtered nav. No role-equality checks.
- [ ] `+page.server.ts` calls `parent()` to read `user` from layout loader.
- [ ] RBAC check at top of `+page.server.ts` and any `+server.ts` it calls.
- [ ] KPI deltas use icon + text, not color only.
- [ ] Table has loading + empty + error states.
- [ ] Mobile (375px): sidebar in sheet, KPIs stacked, table scrolls inside container.
- [ ] Active sidebar item visible.

## P1

- [ ] Breadcrumb in top bar reflects route.
- [ ] Logout POSTs to `+server.ts`, not a GET link.
- [ ] Chart series use `chart-*` tokens.
- [ ] Table virtualizes / paginates at ≥ 100 rows.
- [ ] Sidebar collapse state persists (localStorage).
- [ ] Top bar carries search trigger (Cmd+K).
