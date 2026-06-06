# bosia-seo — Production checklist

> Quote each box back with `file:line` evidence. Don't self-grade from memory.
> Tier 1 is required for every app. Tier 2 for any public-facing surface. Tier 3 for marketing-heavy apps.

## Tier 1 — Share hygiene (REQUIRED for every app)

### Meta basics (10)

- [ ] `<title>` ≤ 60 chars on every public route.
- [ ] `<meta name="description">` ≤ 160 chars on every public route (layout default + overrides).
- [ ] `<link rel="canonical">` present on every route; href derived from `PUBLIC_SITE_ORIGIN`, NOT `page.url.origin`.
- [ ] `<meta name="viewport" content="width=device-width, initial-scale=1">` in `app.html`.
- [ ] `<meta name="theme-color">` matches `theme_color` in `site.webmanifest`.
- [ ] `<html lang="…">` populated (via Bosia's `%bosia.lang%`) matches BRIEF.md language.
- [ ] `<meta charset="UTF-8">` in `app.html`.
- [ ] `<meta name="application-name">` = BRIEF name.
- [ ] `<meta name="apple-mobile-web-app-title">` = BRIEF name.
- [ ] `<meta name="format-detection" content="telephone=no">` (prevents iOS phone-number autolink in copy).

### Open Graph (9)

- [ ] `og:type` set (`website` for layout, `article` / `product` / etc. on content pages).
- [ ] `og:site_name` = BRIEF name.
- [ ] `og:title` ≤ 60 chars.
- [ ] `og:description` ≤ 160 chars.
- [ ] `og:image` is an ABSOLUTE URL (`https://...`), not a relative path.
- [ ] `og:image:width` = 1200.
- [ ] `og:image:height` = 630.
- [ ] `og:locale` uses BCP-47 underscore form (e.g. `id_ID`, `en_US`), not `id` or `en`.
- [ ] `og:url` = canonical URL (matches `<link rel="canonical">`).

### Twitter Card (4)

- [ ] `twitter:card="summary_large_image"`.
- [ ] `twitter:title` ≤ 70 chars.
- [ ] `twitter:description` ≤ 200 chars.
- [ ] `twitter:image` absolute URL, same image as `og:image` unless intentionally different.

### Favicons / PWA (7)

- [ ] `public/favicon.svg` present; `<link rel="icon" href="/favicon.svg" type="image/svg+xml">` in layout.
- [ ] `public/apple-touch-icon.png` (180×180) present; `<link rel="apple-touch-icon" href="/apple-touch-icon.png">` in layout.
- [ ] `public/site.webmanifest` present; `<link rel="manifest" href="/site.webmanifest">` in layout.
- [ ] Manifest `name`, `short_name`, `description` populated from BRIEF.
- [ ] Manifest `theme_color` + `background_color` match palette tokens from BRIEF.
- [ ] Manifest `start_url` = `/`, `scope` = `/`, `display` = `standalone`.
- [ ] Manifest `lang` matches BRIEF language.

## Tier 2 — Indexability (REQUIRED if any unauth-reachable route exists)

### Crawler files (7)

- [ ] `src/routes/robots.txt/+server.ts` exists (or static `public/robots.txt`).
- [ ] `robots.txt` lists `Sitemap:` line pointing to `${PUBLIC_SITE_ORIGIN}/sitemap.xml`.
- [ ] Every private route prefix appears under `Disallow:` in `robots.txt`.
- [ ] `src/routes/sitemap.xml/+server.ts` exists (or static `public/sitemap.xml`).
- [ ] `sitemap.xml` lists ONLY public routes; no private deep links.
- [ ] `sitemap.xml` URLs use `PUBLIC_SITE_ORIGIN`, no hardcoded host.
- [ ] `sitemap.xml` includes `<lastmod>` on each entry (or accept that Google uses crawl date).

### Structured data — minimum (5)

- [ ] JSON-LD `Organization` block in root layout `<svelte:head>`.
- [ ] JSON-LD `WebSite` block in root layout (with `SearchAction` ONLY if a public search endpoint exists).
- [ ] JSON-LD content escaped via `JSON.stringify(...).replace(/</g, "\\u003c")` helper.
- [ ] JSON-LD validates on [validator.schema.org](https://validator.schema.org) with zero errors.
- [ ] No duplicate `@id` across JSON-LD blocks on the same page.

### Environment gate (3)

- [ ] `PUBLIC_SITE_ORIGIN` declared in `.env.example`.
- [ ] Prod-vs-dev gate uses `process.env.NODE_ENV` (auto-set by Bosia + inlined into the client bundle) — NOT a hand-rolled `PUBLIC_ENV` user var.
- [ ] Non-prod emits both `<meta name="robots" content="noindex,nofollow">` AND `robots.txt` returning `Disallow: /`.

## Tier 3 — Rich results (marketing-heavy apps)

### Per-page schemas (5)

- [ ] Article routes emit `Article` or `NewsArticle` JSON-LD with `headline`, `datePublished`, `author`.
- [ ] Product / pricing routes emit `Product` or `Offer`.
- [ ] FAQ sections emit `FAQPage` with `mainEntity` list.
- [ ] Deep nav routes emit `BreadcrumbList`.
- [ ] App route emits `SoftwareApplication` (or `MobileApplication`) when promoting the app itself.

### OG depth (4)

- [ ] Article pages set `article:published_time`, `article:modified_time`, `article:author`, `article:section`.
- [ ] Per-page dynamic OG image route (`src/routes/og/[slug]/+server.ts`) generates a unique 1200×630 PNG per content piece.
- [ ] Every OG image has descriptive `og:image:alt`.
- [ ] OG image file size ≤ 300KB.

### Multilingual / hreflang (4) — when BRIEF.md declares multiple locales

- [ ] `<link rel="alternate" hreflang="…">` per locale.
- [ ] `<link rel="alternate" hreflang="x-default" …>` present.
- [ ] Sitemap either splits per locale OR uses `xhtml:link` alternates.
- [ ] OG `og:locale` matches the current page locale; `og:locale:alternate` lists the others.

## Bosia metadata() / load() integration (4)

- [ ] Any `metadata()` that fetches DB or external data returns `data: { ... }` so `load()` reuses it via `event.metadata`. No duplicate fetch.
- [ ] `load()` destructures `metadata` and uses `metadata?.foo ?? fallback` — the page still renders if `metadata()` timed out (`METADATA_TIMEOUT`, default 3000ms).
- [ ] No secrets in `metadata().data` — assume it will be streamed to the client through `load()`'s return.
- [ ] `metadata()` does not duplicate work `load()` already needs to do (or vice versa).

## Cross-cutting hygiene

- [ ] No duplicate OG tags on a page (layout + page both setting same tag = bug).
- [ ] No description over 160 chars on any route.
- [ ] No `og:image` smaller than 600×315 (preview cards collapse to small thumbnail).
- [ ] OG image text legible at thumbnail size (~300px wide).
- [ ] No trailing-slash inconsistency between canonical and actual URL.
- [ ] No mixed http/https inside JSON-LD `url` fields.
- [ ] No PII or session info in canonical URLs (strip query params like `?token=`).
- [ ] Pasting a prod URL into WhatsApp / Slack / FB renders the preview card within ~3s.
- [ ] Lighthouse SEO score ≥ 95 on `/` and `/login` (or equivalent public routes).
