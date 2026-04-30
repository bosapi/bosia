---
title: Bosia
description: Framework fullstack yang cepat dan lengkap, dibangun di atas Bun + Svelte 5 + ElysiaJS.
---

Framework fullstack yang cepat dan lengkap. Konvensi SvelteKit, tanpa Node.js, tanpa Vite, tanpa kerumitan adapter.

## Fitur

- **File-Based Routing** — Konvensi SvelteKit — `+page.svelte`, `+layout.svelte`, `+page.server.ts`, parameter dinamis `[params]`, grup rute `(name)`.
- **Server-Side Rendering** — Setiap halaman dirender di server dengan streaming SSR dan hidrasi penuh di sisi klien.
- **Server Loaders** — Fungsi `load()` dengan pengaliran data `parent()`, `metadata()` untuk SEO, dan `fetch` yang mendukung sesi.
- **API Routes** — Ekspor fungsi HTTP verb dari `+server.ts` — GET, POST, PUT, PATCH, DELETE.
- **Middleware Hooks** — `hooks.server.ts` dengan komposisi `sequence()`. Atur locals, kelola cookies, catat request.
- **Form Actions** — Form actions bergaya SvelteKit dengan validasi `fail()` dan progressive enhancement.
- **Tailwind CSS v4** — Sudah terpasang dengan design token terinspirasi shadcn, dark mode, dan utilitas `cn()`.
- **CLI + Registry** — `bosia create`, `dev`, `build`, `add` (komponen), `feat` (scaffold fitur).

## Mulai Cepat

```bash
bunx bosia create my-app
cd my-app
bun run dev
```

Buka [http://localhost:9000](http://localhost:9000) dan mulai membangun.

## Tech Stack

| Lapisan | Teknologi        |
| ------- | ---------------- |
| Runtime | Bun              |
| HTTP    | ElysiaJS         |
| UI      | Svelte 5 (Runes) |
| CSS     | Tailwind CSS v4  |
| Bundler | Bun.build        |
