# Bosia Roadmap

Tracks framework-level performance, correctness, and DX work. See `CHANGELOG.md` for shipped changes.

## Performance

### Done

- [x] Resolve page route once per request and thread through `renderSSRStream` / `renderPageWithFormData` / form-action handler (0.4.3).
- [x] Cache `getPublicDynamicEnv()` at module scope (0.4.3).
- [x] Linear `parent()` data merging in layout loaders — O(d²) → O(d) with per-layer snapshot (0.4.3).
- [x] Drop redundant `onBeforeHandle` apiRoutes scan; non-GET catch-alls already cover every method (0.4.3).

### Open

- [ ] **Truly progressive SSR streaming** — `renderSSRStream` is currently blocking before first byte (load → render → enqueue prebuilt chunks). True progressive streaming depends on selective reload primitives.
    - Blocked on: `depends()` / `invalidate()` (v0.2.1) and the trie-based matcher (v0.2.2) for cheap repeat lookups.
- [ ] **Reduce `safeJsonStringify` cost on large loader payloads** — guidance, not a `trusted` opt-out flag. Server-loader data routinely carries user-generated DB content; removing the XSS escape per payload is unsafe. Document "keep loader data lean" and consider one combined regex pass over the embedded JSON-script block.

## Reference

- See `backup/PERFORM_ISSUES.md` for the full request-pipeline review (2026-05-08).
