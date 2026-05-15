# CRUD flow — checklist

## P0

- [ ] Tables in `*.table.ts`, generated migration applied.
- [ ] Service is pure (no `locals`, no HTTP).
- [ ] Permissions declared in `lib/rbac/resources.ts`.
- [ ] Every action calls `locals.can(...)` at the top.
- [ ] Every action validates input before invoking service.
- [ ] Destructive action confirms via `ui/alert-dialog`; copy includes the resource name.
- [ ] List view covers loading + empty + error.
- [ ] `+page.server.ts` calls `parent()` if it uses layout-loaded data.

## P1

- [ ] Toasts (`ui/sonner`) on success/failure.
- [ ] Optimistic updates on toggles.
- [ ] Search/filter in the table header.
- [ ] Pagination or virtualization ≥ 100 rows.
- [ ] Row actions in `ui/dropdown-menu`.
- [ ] URL state for filters/page (deep-linkable).

## File map (substitute `<resource>`)

```
src/features/<resource>/
├── <resource>.table.ts
├── <resource>.service.ts
├── <resource>.schema.ts
└── index.ts

src/routes/(private)/<resource>/
├── +page.svelte                 (list + create dialog)
├── +page.server.ts              (load list; actions.create, actions.delete)
├── [id]/+page.svelte            (edit form)
└── [id]/+page.server.ts         (load one; actions.update, actions.delete)
```
