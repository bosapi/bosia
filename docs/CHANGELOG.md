# Changelog

All notable changes to the Bosia docs site and component registry are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [0.7.8] - 2026-06-21

### Added

- Docs and shop-template skill now cover the new `store` template (Postgres + MinIO/S3).
- Deployment guide: a "Sandboxed / Multi-Tenant Hosting" note listing the native build-tool addons (`@tailwindcss/oxide`, `lightningcss`, `@parcel/watcher`) hosts must allowlist (EN + ID).

### Changed

- `file-upload` S3 driver now serves files through the app's `/uploads` route (same as local) instead of returning a direct bucket URL — keeps the per-user ownership check and works with a private/loopback `S3_ENDPOINT`.

## [0.7.7] - 2026-06-20

### Added

- New `/llms.txt` lists all skills, blocks, components and themes so AI agents can discover them.

### Fixed

- SEO skill rewritten: per-page tags now come from `metadata()` so link previews actually show up.

---

## [0.7.6] - 2026-06-19

### Changed

- CRUD skill now tells AI to refresh the cache after saving, so lists never show stale data.

---

## [0.7.5] - 2026-06-17

### Added

- Indonesian translations for the File Upload, Inspector, Navigation, Plugins, and Server Metadata guides.
- Indonesian translations for all 62 component pages (overview + every UI component).
- Indonesian translations for all 37 block pages (cards, files, heros, navbars, storefront).
- Indonesian translations for all 21 theme pages (overview, creating themes, and every theme).
- Indonesian translations for all 11 page templates (auth and storefront), completing full parity.

### Fixed

- Pages without an Indonesian translation no longer point search engines to a missing page.
- Indonesian Changelog and Roadmap pages now show the English content instead of being empty.

---

## [0.7.4] - 2026-06-16

### Added

- This changelog now tracks docs site and component registry changes, separate from the framework.
- New navbar block family: 18 ready-made navigation bars across standard, themed and app layouts.
- New transparent overlay navbar that floats over a hero image, for full-bleed photo heroes.

### Fixed

- Hero blocks no longer include their own navbar, so it won't clash with the layout navbar.
- Hide the unusable menu button on the homepage.
- Sidebar sections now collapse, opening to your current page.
