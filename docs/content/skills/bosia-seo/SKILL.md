---
name: bosia-seo
description: SEO baseline — title/description/canonical, Open Graph, Twitter cards, favicons, web manifest, robots.txt, sitemap.xml, JSON-LD structured data, hreflang. Share-critical meta via per-route `metadata()` in `+page.server.ts` (server-rendered into raw <head>); layout `<svelte:head>` holds only chrome + JSON-LD. Required even for auth-gated apps (share previews).
triggers:
  - seo
  - meta tags
  - open graph
  - og tags
  - og image
  - twitter card
  - share preview
  - link preview
  - sitemap
  - robots.txt
  - structured data
  - json-ld
  - canonical url
  - favicon
  - apple-touch-icon
  - web manifest
  - pwa manifest
  - hreflang
  - search ranking
  - google indexing
od:
  mode: convention
  category: framework
bosia:
  framework: true
  requires:
    blocks: []
    themes: []
    components: []
    feats: []
  targets:
    routes:
      - "src/routes/+layout.svelte"
      - "src/routes/sitemap.xml/+server.ts"
      - "src/routes/robots.txt/+server.ts"
    files:
      - "src/app.html"
      - "public/og-image.png"
      - "public/apple-touch-icon.png"
      - "public/site.webmanifest"
  stack: [svelte-5-runes, sveltekit]
---

# bosia-seo

> **STOP. Run this before any first deploy, and whenever identity/tagline changes.**
> Even fully auth-gated apps need Tier 1 — share previews show up in WhatsApp, Slack, FB the first time anyone pastes the URL.

## What it builds

Production-standard SEO and link-preview hygiene for a Bosia app:

- A small SEO lib — `src/lib/seo/{site,jsonld,metadata}.ts` — with a `buildPageMeta()` helper.
- Per-route `metadata()` in `+page.server.ts` — title, description, canonical, Open Graph, Twitter card — server-rendered into the raw `<head>` (the only channel non-JS share scrapers read in Bosia). Titles follow `{Page} · {App}`.
- A slim root `src/routes/+layout.svelte` `<svelte:head>` — browser/PWA chrome + JSON-LD only.
- Favicon ecosystem — `favicon.svg` (shell), `apple-touch-icon.png`, `icon-512.png`, `site.webmanifest`.
- Dynamic `robots.txt` and `sitemap.xml` via `+server.ts` (origin-aware, no hardcoded host).
- JSON-LD structured data — `Organization` + `WebSite` at layout, page-specific schemas on content routes.
- Environment-gated `noindex` for staging/preview, emitted from `metadata()` so crawlers actually see it.

## When to use

- Before first production deploy of any Bosia app.
- Whenever BRIEF.md `tagline`, `name`, or `language` changes.
- Before any marketing push, app-store listing, or external announcement.
- When the user reports "WhatsApp preview is empty", "link looks ugly when shared", or "Google can't find us".

Anti-trigger: pure CLI tools, internal-only IPs behind VPN with no external surface, or apps where every URL hard-redirects to a single login screen with no public meta to project.

## Three tiers

### Tier 1 — Share hygiene (ALWAYS)

Required for every app, including fully auth-gated ones.

- `<title>` per route + sensible layout default
- `<meta name="description">`
- `<link rel="canonical">`
- Open Graph basics (`og:type`, `og:title`, `og:description`, `og:image`, `og:url`, `og:site_name`, `og:locale`)
- Twitter card (`twitter:card=summary_large_image` + title/desc/image)
- Favicon set (svg + apple-touch-icon)
- Web manifest with `theme_color` matching layout meta

### Tier 2 — Indexability (public-facing routes)

Add when the app has any unauth-reachable surface.

- `robots.txt` — disallow private paths, allow public, point to sitemap
- `sitemap.xml` — list every genuinely public route
- `hreflang` link tags when BRIEF.md `language` covers multiple locales
- JSON-LD `Organization` + `WebSite` (with `SearchAction` if site search exists)
- `noindex,nofollow` gate when `process.env.NODE_ENV !== "production"`

### Tier 3 — Rich results (marketing-heavy apps)

Add when the app has marketing/content surface (blog, docs, product pages).

- Per-page JSON-LD — `Article`, `Product`, `FAQPage`, `BreadcrumbList`, `SoftwareApplication`, `LocalBusiness`
- OG article tags (`article:published_time`, `article:author`, `article:section`)
- Per-page dynamic OG image generation (edge route)
- Image `alt` text discipline (every hero / OG image)
- Structured breadcrumbs on deep routes

## Inputs from BRIEF.md

Pull these — do not invent:

| BRIEF field          | Where it lands                                                               |
| -------------------- | ---------------------------------------------------------------------------- |
| Identity → Name      | `og:site_name`, `application-name`, `apple-mobile-web-app-title`, manifest   |
| Identity → Tagline   | Default `<meta name="description">`, `og:description`, `twitter:description` |
| Identity → Language  | `<html lang>`, `og:locale` (e.g. `id_ID`, `en_US`), `hreflang`               |
| Visual → Theme color | `<meta name="theme-color">`, manifest `theme_color` + `background_color`     |
| Visual → Mark/logo   | Source for `apple-touch-icon.png`, mask-icon, OG image visual                |
| Platform → Audience  | Informs OG image language + locale of meta strings                           |

## Rules

### R1 — Share-critical meta comes from per-route `metadata()`, NOT the root layout `<svelte:head>`

> This is the rule most people get wrong on Bosia. Read the three reasons before reaching for `<svelte:head>`.

In Bosia there are **two different head channels with different visibility**:

1. **`metadata()`** exported from `+page.server.ts` → bosia renders its return as **raw `<head>` tags during SSR** (`renderer.ts` → `buildMetadataChunk`) and re-applies title/description on client nav (`App.svelte`). This is what non-JS crawlers and share scrapers actually read.
2. **`<svelte:head>`** in a `+layout.svelte` / `+page.svelte` → bosia ships it as a **client-side hydration script** (`html.ts`: `document.head.insertAdjacentHTML(...)`). It only materializes once JS runs. **WhatsApp, Facebook, Slack, Twitter/X, and other link-preview scrapers do NOT run JS — so any OG/Twitter tag placed in `<svelte:head>` is invisible to them.** Googlebot does render JS, so JSON-LD survives there.

Therefore every **share-critical** tag — `<title>`, `description`, `canonical`, all `og:*`, all `twitter:*`, per-page `robots` — must come from `metadata()`. The root layout `<svelte:head>` keeps only browser/PWA chrome (`theme-color`, `apple-*`, manifest, favicon) and JSON-LD.

Three Bosia facts that rule out the old "site-wide meta in the layout + per-page `data.seo`" pattern:

- **Layouts never receive a child page's data.** `App.svelte` renders each layout with `data = layoutData[index]` — its OWN depth only. A page `load()` returning `{ seo }` never reaches the root layout. (`$page.data` doesn't exist in Bosia either — `page` exposes only `url` + deprecated `params`.)
- **`page.url` is stubbed to `http://localhost/` during SSR** (`page.svelte.ts`). A canonical/og:url derived from `page.url` in a layout is wrong on the server pass. `metadata({ url })` gets the real URL.
- **`<svelte:head>` is client-injected** (above) — wrong channel for scrapers.

✅ The pattern: a `buildPageMeta()` helper + one `metadata()` per route.

```ts
// src/lib/seo/site.ts — single source of truth
import { PUBLIC_STATIC_SITE_ORIGIN } from "$env";

export const SITE = {
	name: "Komba",
	tagline: "Catatan ternak domba untuk peternakan menengah.",
	description: "Catat kelahiran, bobot, dan kesehatan domba dalam satu aplikasi.",
	locale: "id_ID", // og:locale
	lang: "id", // <html lang> + JSON-LD inLanguage
	themeColor: "#F5F1E8",
	origin: PUBLIC_STATIC_SITE_ORIGIN, // never the request host — see R2
	ogImage: "/og-image.png",
} as const;
```

```ts
// src/lib/seo/metadata.ts — builds the bosia Metadata object
import type { Metadata } from "bosia";
import { SITE } from "./site.ts";

type PageMetaArgs = {
	title?: string; // omit on home for the brand title
	description?: string; // ≤160 chars; falls back to SITE.description
	path: string; // always url.pathname — for canonical + og:url
	ogImage?: string;
	ogType?: "website" | "article" | "product";
	noindex?: boolean; // auth-gated / private routes
};

export function buildPageMeta({
	title,
	description,
	path,
	ogImage,
	ogType = "website",
	noindex = false,
}: PageMetaArgs): Metadata {
	const fullTitle = title ? `${title} · ${SITE.name}` : `${SITE.name} — ${SITE.tagline}`;
	const desc = description ?? SITE.description;
	const url = `${SITE.origin}${path}`;
	const image = `${SITE.origin}${ogImage ?? SITE.ogImage}`;

	const meta: NonNullable<Metadata["meta"]> = [
		{ property: "og:site_name", content: SITE.name },
		{ property: "og:locale", content: SITE.locale },
		{ property: "og:type", content: ogType },
		{ property: "og:title", content: fullTitle },
		{ property: "og:description", content: desc },
		{ property: "og:url", content: url },
		{ property: "og:image", content: image },
		{ property: "og:image:width", content: "1200" },
		{ property: "og:image:height", content: "630" },
		{ name: "twitter:card", content: "summary_large_image" },
		{ name: "twitter:title", content: fullTitle },
		{ name: "twitter:description", content: desc },
		{ name: "twitter:image", content: image },
	];

	// Server-rendered noindex — non-public routes always, every route off prod.
	if (noindex || process.env.NODE_ENV !== "production") {
		meta.push({ name: "robots", content: "noindex,nofollow" });
	}

	return {
		title: fullTitle,
		description: desc,
		lang: SITE.lang,
		meta,
		link: [{ rel: "canonical", href: url }],
	};
}
```

```ts
// src/routes/(public)/login/+page.server.ts — one per route, even static ones
import type { MetadataEvent } from "bosia";
import { buildPageMeta } from "$lib/seo/metadata.ts";

export function metadata({ url }: MetadataEvent) {
	return buildPageMeta({
		title: "Masuk",
		description: "Masuk ke akun Komba Anda.",
		path: url.pathname,
	});
}
```

`metadata()` must live in **`+page.server.ts`** (bosia only calls `route.pageServer`'s `metadata`; a `+page.ts` export is ignored). Every leaf route needs one — including private ones (pass `noindex: true`) and dynamic ones (read `params`, e.g. `getApp(params.id)`).

✅ The root `+layout.svelte` — chrome + JSON-LD only, no OG/title/canonical:

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import "../app.css";
	import { SITE } from "$lib/seo/site.ts";
	import { jsonLd } from "$lib/seo/jsonld.ts";

	let { children }: { children: any } = $props();

	const orgLd = jsonLd({
		"@context": "https://schema.org",
		"@type": "Organization",
		name: SITE.name,
		url: SITE.origin,
		logo: `${SITE.origin}/logo-mark.svg`,
		description: SITE.description,
	});
	const siteLd = jsonLd({
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: SITE.name,
		url: SITE.origin,
		inLanguage: SITE.lang,
	});
</script>

<svelte:head>
	<meta name="application-name" content={SITE.name} />
	<meta name="apple-mobile-web-app-title" content={SITE.name} />
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="format-detection" content="telephone=no" />
	<meta name="theme-color" content={SITE.themeColor} />
	<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
	<link rel="manifest" href="/site.webmanifest" />

	{@html `<script type="application/ld+json">${orgLd}</script>`}
	{@html `<script type="application/ld+json">${siteLd}</script>`}
</svelte:head>

{@render children()}
```

> `<html lang>` and `<link rel="icon">` are emitted by bosia's HTML shell (`app.html` + `metadata.lang`, see R10) — don't re-declare the favicon in `<svelte:head>`.

Per-page JSON-LD (Tier 3) still goes in that page's `<svelte:head>` (Googlebot renders JS) — see R6.

### R2 — Canonical URLs come from `PUBLIC_STATIC_SITE_ORIGIN`, not the request host

The request host (`event.url.origin` in a loader, `page.url.origin` in a component) reflects the **incoming request host**. In production behind a reverse proxy with multiple hostnames (apex, staging, preview deploy), this leaks the wrong canonical to Google and splits your link equity. Always pin canonical + `og:url` to a build-time origin constant — `SITE.origin` from `$env` (above). `metadata()` builds the absolute URL as `${SITE.origin}${url.pathname}`: real pathname from the event, fixed host from env.

Use the **`PUBLIC_STATIC_*`** tier so the value is inlined at build (it never changes at runtime) and is available on both the SSR pass and the client bundle:

```bash
# .env.production
PUBLIC_STATIC_SITE_ORIGIN=https://app.example.com
# .env (dev)
PUBLIC_STATIC_SITE_ORIGIN=http://localhost:9000
```

(The plain `PUBLIC_` tier — runtime-injected via `window.__BOSIA_ENV__` — also works, but origin is build-stable, so `PUBLIC_STATIC_` is the right tier and matches `PUBLIC_STATIC_APP_NAME`.)

### R3 — Dynamic `robots.txt` and `sitemap.xml` via `+server.ts`

Static files in `public/` work but hardcode the origin. Prefer server routes so the same build serves correct content per environment.

```ts
// src/routes/robots.txt/+server.ts
import type { RequestEvent } from "bosia";
import { SITE } from "$lib/seo/site.ts";

// Route groups like (private) are stripped from URLs — list the REAL prefixes.
const PRIVATE_PREFIXES = [
	"/dashboard",
	"/api",
	// app-specific private folders go here
];

export function GET(_event: RequestEvent) {
	const isProd = process.env.NODE_ENV === "production";
	const body = isProd
		? [
				"User-agent: *",
				...PRIVATE_PREFIXES.map((p) => `Disallow: ${p}`),
				"Allow: /",
				"",
				`Sitemap: ${SITE.origin}/sitemap.xml`,
			].join("\n")
		: "User-agent: *\nDisallow: /\n";

	return new Response(body, {
		headers: { "content-type": "text/plain; charset=utf-8" },
	});
}
```

```ts
// src/routes/sitemap.xml/+server.ts
import type { RequestEvent } from "bosia";
import { SITE } from "$lib/seo/site.ts";

const PUBLIC_PATHS = ["/", "/login", "/register"] as const;

export function GET(_event: RequestEvent) {
	const now = new Date().toISOString().slice(0, 10);
	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PUBLIC_PATHS.map(
	(p) =>
		`  <url><loc>${SITE.origin}${p}</loc><lastmod>${now}</lastmod><changefreq>monthly</changefreq></url>`,
).join("\n")}
</urlset>`;

	return new Response(body, {
		headers: { "content-type": "application/xml; charset=utf-8" },
	});
}
```

Both routes are `+server.ts` action endpoints — no `+page.svelte` siblings, per `bosia-routing`.

### R4 — Web manifest at `public/site.webmanifest`

Required for Android PWA install prompts and theme-aware iOS chrome. Match `theme_color` to the layout `<meta name="theme-color">`. Match `lang` to BRIEF.md language.

```json
{
	"name": "Komba",
	"short_name": "Komba",
	"description": "Catatan ternak domba untuk peternakan menengah",
	"start_url": "/",
	"scope": "/",
	"display": "standalone",
	"background_color": "#F5F1E8",
	"theme_color": "#F5F1E8",
	"lang": "id",
	"icons": [
		{ "src": "/favicon.svg", "sizes": "any", "type": "image/svg+xml", "purpose": "any" },
		{
			"src": "/apple-touch-icon.png",
			"sizes": "180x180",
			"type": "image/png",
			"purpose": "any"
		},
		{
			"src": "/icon-512.png",
			"sizes": "512x512",
			"type": "image/png",
			"purpose": "any maskable"
		}
	]
}
```

The 512×512 maskable icon enables Android adaptive icons; rasterize from the brand mark with safe-area padding (logo fits in inner 80% circle).

### R5 — OG image discipline

- **Dimensions**: 1200×630 (1.91:1). Declare `og:image:width` and `og:image:height` — preview cards render faster.
- **Size**: ≤ 300KB. Facebook silently drops images > 5MB but slows preview render long before that.
- **Format**: PNG for crisp text, JPG for photographic. Avoid WebP (still spotty in legacy crawlers).
- **Content**: brand mark + tagline. Same locale as BRIEF.md `language`. Test at thumbnail size — text must read at ~300px wide.
- **URL**: must be absolute (`https://...`), not relative. The pattern above (`${SITE.origin}${path}`) is correct.
- **Dynamic per-page OG** (Tier 3): expose `src/routes/og/[slug]/+server.ts` returning a generated PNG via Satori/Resvg or a server-side canvas lib. Out of scope for Tier 1.

### R6 — JSON-LD `Organization` + `WebSite` at layout, page-specific schemas on leaves

Use `{@html}` with `<script type="application/ld+json">` inside `<svelte:head>` — escape user-controlled strings to prevent XSS. JSON-LD is the ONE SEO payload that's fine in `<svelte:head>`: it's only consumed by Googlebot, which renders JS (unlike the share scrapers in R1).

Helper:

```ts
// src/lib/seo/jsonld.ts
export function jsonLd(data: unknown): string {
	return JSON.stringify(data).replace(/</g, "\\u003c");
}
```

Layout block (see the full layout in R1) reads `SITE` from `$lib/seo/site.ts`:

```svelte
<svelte:head>
	{@html `<script type="application/ld+json">${jsonLd({
		"@context": "https://schema.org",
		"@type": "Organization",
		name: SITE.name,
		url: SITE.origin,
		logo: `${SITE.origin}/logo-mark.svg`,
	})}</script>`}

	{@html `<script type="application/ld+json">${jsonLd({
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: SITE.name,
		url: SITE.origin,
	})}</script>`}
</svelte:head>
```

(If a `SearchAction` is desired, add it to the `WebSite` object — only when a public `/search?q=` endpoint actually exists.)

Per-page (Tier 3) examples — Article, Product, FAQPage, BreadcrumbList — live in `references/meta-template.md`.

### R7 — `hreflang` only when BRIEF.md declares multiple locales

When BRIEF.md `Identity → Language` lists a single locale (most Bosia apps), skip `hreflang` — adding it with a single locale confuses Google. When multi-locale:

```svelte
<link rel="alternate" hreflang="id" href={`${SITE.origin}/id${page.url.pathname}`} />
<link rel="alternate" hreflang="en" href={`${SITE.origin}/en${page.url.pathname}`} />
<link rel="alternate" hreflang="x-default" href={`${SITE.origin}${page.url.pathname}`} />
```

### R8 — Auth-gated apps still need Tier 1; sitemap lists only public surface

The single biggest mistake: skipping SEO entirely because "the app is auth-only." Anyone who shares a link to `/login` from WhatsApp expects a preview card.

For auth-gated apps:

- Tier 1: full meta on root layout (renders for `/login`, `/onboarding`, etc.).
- Tier 2: `robots.txt` disallows every private prefix; `sitemap.xml` lists only `/`, `/login`, `/onboarding`, `/forgot-password` (or whichever public routes exist).
- Canonical for private pages still points to the public origin (does not leak session info).

### R9 — Environment gate — staging emits `noindex`

Use the built-in `process.env.NODE_ENV` — Bosia's bundler inlines it at build time (via `define`), so it's safe on BOTH the SSR pass and the client bundle. Do NOT introduce a separate `PUBLIC_ENV` user var; that's a duplicate of what the framework already provides and risks drifting from `NODE_ENV`.

Emit the `noindex` from `metadata()`, NOT a layout `<svelte:head>` `{#if}` block — the staging gate has to reach non-JS crawlers, and (per R1) `<svelte:head>` is client-injected. The `buildPageMeta()` helper in R1 already bakes this in:

```ts
// inside buildPageMeta() — runs server-side, so NODE_ENV is correct
if (noindex || process.env.NODE_ENV !== "production") {
	meta.push({ name: "robots", content: "noindex,nofollow" });
}
```

In `+server.ts` files (robots.txt, sitemap) the same `process.env.NODE_ENV === "production"` check works — server-side it's natively populated by `bosia dev` / `bosia build` / `bosia start`.

Pair with the dynamic `robots.txt` returning `Disallow: /` in non-prod (see R3). Both layers, since meta covers HTML and robots.txt covers crawl budget.

> Why not `PUBLIC_ENV`? Bosia's `.env` convention exposes `PUBLIC_*` vars via `$env` and inlines `process.env.NODE_ENV` separately. NODE_ENV is set automatically by the framework binary (`bosia dev` → `development`, `bosia build`/`start` → `production`); a hand-rolled `PUBLIC_ENV` is one more thing to keep in sync with no benefit.

### R10 — `<html lang>` is driven by `metadata().lang`, defaulting to `en`

Bosia's `src/app.html` uses `lang="%bosia.lang%"`, and the HTML shell fills that placeholder from the **current route's `metadata().lang`** (`renderer.ts` passes `metadata?.lang` → `safeLang()` → `en` when unset). There is no automatic BRIEF→lang wiring at runtime: a route that doesn't return `lang` renders `<html lang="en">`.

So set `lang` on every route. `buildPageMeta()` (R1) does this for you via `SITE.lang` — keep `SITE.lang` in sync with BRIEF.md `language` (`"id"`, `"en"`, …), and don't hardcode the attribute in `app.html`. Verify:

```bash
curl -s http://localhost:9000/ | grep -oE '<html lang="[a-z-]+"'
```

### R11 — `metadata()` fetches once; share with `load()` via the `data` field

When `metadata()` needs DB or external data (e.g. an article title for `og:title`, a product name for `og:description`), DO NOT fetch the same row again in `load()`. `metadata()` runs first; return what `load()` needs through the `data` property — it surfaces as `event.metadata` in the loader.

```ts
// src/routes/blog/[slug]/+page.server.ts
import type { MetadataEvent, LoadEvent } from "bosia";
import { error } from "bosia";

import { BlogService } from "../../../features/blog";
import { buildPageMeta } from "$lib/seo/metadata";

export async function metadata({ params, url }: MetadataEvent) {
	const post = await BlogService.bySlug(params.slug);
	if (!post) return buildPageMeta({ title: "Not found", path: url.pathname });

	return {
		...buildPageMeta({
			title: `${post.title} · Blog`,
			description: post.excerpt,
			path: url.pathname,
			ogImage: `/og/${post.slug}.png`,
			ogType: "article",
		}),
		// Share the fetched row with load() — no second DB hit.
		data: { post },
	};
}

export async function load({ params, metadata }: LoadEvent) {
	// Reuse data from metadata(); fall back only if metadata() didn't run
	// (e.g. timed out per METADATA_TIMEOUT — load runs regardless).
	const post = metadata?.post ?? (await BlogService.bySlug(params.slug));
	if (!post) error(404, "Post not found");
	return { post };
}
```

Rules:

- The shared payload is `data: { ... }` inside the `metadata()` return — NOT a top-level field.
- In `load()` it lands at `event.metadata` (the `data` wrapper is unwrapped by the framework). Destructure `{ metadata }: LoadEvent`.
- Always keep a fallback fetch in `load()`. If `metadata()` exceeds `METADATA_TIMEOUT` (default 3000ms), the page still renders without metadata — `event.metadata` will be `null`. Don't crash the page.
- Don't put secrets in `data`. Anything `load()` returns is streamed to the client; even if `metadata().data` is server-only, you'll likely re-emit the same object via `load()`'s return — treat the payload as public from the start.
- If `metadata()` and `load()` both need the same expensive computation (rendering, formatting), do it ONCE in `metadata()` and stash the result in `data`.

Anti-pattern — duplicate fetch:

```ts
// ❌ Two DB hits per request
export async function metadata({ params }) {
	const post = await BlogService.bySlug(params.slug); // hit #1
	return { title: post.title };
}
export async function load({ params }) {
	const post = await BlogService.bySlug(params.slug); // hit #2 — same row
	return { post };
}
```

Anti-pattern — top-level field instead of `data`:

```ts
// ❌ load() will not see this; event.metadata stays null
export async function metadata({ params }) {
	const post = await BlogService.bySlug(params.slug);
	return { title: post.title, post };
}
```

## Anti-patterns

| ❌ Anti-pattern                                           | ✅ Correct                                                                                        |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| OG/Twitter tags in `+layout.svelte` `<svelte:head>`       | Emit them from per-route `metadata()` — `<svelte:head>` is client-injected, scrapers miss it (R1) |
| `<title>Welcome</title>` only — no description            | Title + description + canonical at minimum                                                        |
| `og:image` is relative `/og.png`                          | Absolute `https://app.example.com/og.png`                                                         |
| Canonical / `og:url` from the request host                | From `SITE.origin` (`PUBLIC_STATIC_SITE_ORIGIN`) + `url.pathname`                                 |
| Per-page `seo` returned from `load()` for the root layout | Layout never sees page data — use `metadata()` in `+page.server.ts`                               |
| `metadata()` in `+page.ts`                                | Must be `+page.server.ts` — bosia ignores universal-module metadata                               |
| Description > 160 chars                                   | ≤ 160 chars (Google truncates)                                                                    |
| Title > 60 chars                                          | ≤ 60 chars (Google truncates)                                                                     |
| OG image without declared width/height                    | Always include `og:image:width` / `og:image:height`                                               |
| Hardcoded host in `robots.txt` / `sitemap.xml`            | Origin from `SITE.origin`                                                                         |
| Staging deploys indexed by Google                         | `metadata()` emits `noindex` off-prod + `robots: Disallow: /` (R3/R9)                             |
| JSON-LD with user content not escaped                     | `JSON.stringify(...).replace(/</g, "\\u003c")` helper                                             |
| Marketing-quality OG image (5MB) shipped to every share   | ≤ 300KB                                                                                           |
| `og:locale=id` (wrong)                                    | `og:locale=id_ID` (BCP 47-ish; underscore, country code)                                          |
| `hreflang="id"` with no `x-default`                       | Always pair with `x-default` when multilingual                                                    |
| Skipping SEO because app is auth-gated                    | Tier 1 still required — share previews                                                            |

## Workflow

1. **Read BRIEF.md** — capture name, tagline, language, theme color, audience locale.
2. **Add the SEO lib** — `src/lib/seo/site.ts` (SITE constants), `jsonld.ts` (escape helper), `metadata.ts` (`buildPageMeta`). See R1.
3. **Set env** — add `PUBLIC_STATIC_SITE_ORIGIN` to `.env` / `.env.example` (and `.env.production`). Per R2 / `bosia-env`.
4. **Slim the root layout** — `src/routes/+layout.svelte` keeps only chrome + JSON-LD (R1); no title/OG/canonical.
5. **Add `metadata()` to every leaf route** — a `+page.server.ts` per route returning `buildPageMeta(...)`. Public routes indexable; private routes `noindex: true`; dynamic routes read `params`.
6. **Add public assets** — `public/og-image.png` (1200×630, ≤300KB), `public/apple-touch-icon.png` (180×180), `public/icon-512.png` (512×512), `public/site.webmanifest` (R4).
7. **Add Tier 2 routes** — `src/routes/robots.txt/+server.ts` (R3), `src/routes/sitemap.xml/+server.ts` (R3).
8. **Add JSON-LD** — Organization + WebSite at layout (R6); per-page schemas in the content page's `<svelte:head>`.
9. **Run checklist** — `references/checklist.md`. Cannot mark skill done until every box ticked.
10. **Verify** — see "Verification" below; confirm OG tags appear in the RAW HTML, not just the hydration script.

## Verification

After applying:

- **Source check** — `curl -s https://app/login | grep -E 'og:|twitter:|canonical|description'` returns ≥ 10 lines.
- **Raw-head check (Bosia-critical)** — the OG/Twitter tags must be real `<meta …>` in the served HTML, not escaped inside the `document.head.insertAdjacentHTML(...)` hydration script. `curl -s https://app/ | grep -oE '<meta property="og:image" content="[^"\\]*"'` must return a line (real quotes). If it only shows up as `content=\"…\"`, the tags are in `<svelte:head>` and scrapers can't see them — move them to `metadata()` (R1).
- **Open Graph validator** — paste prod URL into [opengraph.xyz](https://www.opengraph.xyz) → preview renders with image + tagline.
- **Twitter Card validator** — [cards-dev.twitter.com/validator](https://cards-dev.twitter.com/validator) (or post to a test thread) → large-image card renders.
- **Schema validator** — paste JSON-LD into [validator.schema.org](https://validator.schema.org) → zero errors.
- **robots / sitemap** — `curl -I https://app/robots.txt` returns 200 + `text/plain`; `curl -I https://app/sitemap.xml` returns 200 + `application/xml`.
- **Lighthouse** — SEO score ≥ 95 on any public page.
- **WhatsApp / Slack** — paste prod URL into a personal chat; preview card renders with image + tagline within ~3s.

## Bosia conventions

- `bosia-brief-review` — BRIEF.md `language` → `SITE.lang` (drives `<html lang>` via `metadata().lang`) and `SITE.locale` (`og:locale`).
- `bosia-routing` — `+server.ts` shape for `robots.txt` / `sitemap.xml`; `metadata()` only runs from `+page.server.ts`.
- `bosia-env` — `PUBLIC_STATIC_SITE_ORIGIN` belongs in the `PUBLIC_STATIC_` tier (build-inlined, available SSR + client). For prod-vs-dev detection use the framework-managed `process.env.NODE_ENV`, not a hand-rolled `PUBLIC_ENV`.
- `bosia-page-shell` — root `+layout.svelte` owns chrome + JSON-LD; per-route `metadata()` owns share-critical meta (title/description/canonical/OG/Twitter).
- `bosia-landing` / `bosia-saas-landing` — marketing page scaffolds depend on Tier 1 + 2 from this skill.
- `bosia-security-review` — XSS check on JSON-LD escaping.

## Checklist gate

See `references/checklist.md` — 49+ items grouped into Meta basics, Open Graph, Twitter, Favicons/PWA, Crawler, Structured data, Performance, Multilingual. Cannot claim "done" until all relevant tier boxes are checked.

## References

- `references/checklist.md` — production gate.
- `references/meta-template.md` — copy-paste `<svelte:head>` snippet.
- `example.svelte` — minimal `+layout.svelte` end-to-end.
- [Open Graph protocol](https://ogp.me) — canonical reference.
- [schema.org](https://schema.org) — structured data types.
- [Google Search Central — title & description guidelines](https://developers.google.com/search/docs/appearance/title-link).
