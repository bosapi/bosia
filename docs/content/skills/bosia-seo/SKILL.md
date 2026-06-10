---
name: bosia-seo
description: SEO baseline — title/description/canonical, Open Graph, Twitter cards, favicons, web manifest, robots.txt, sitemap.xml, JSON-LD structured data, hreflang. Layout-wide defaults via `$page`; per-page overrides via `<svelte:head>`. Required even for auth-gated apps (share previews).
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

Production-standard SEO and link-preview hygiene for a Bosia/SvelteKit app:

- Site-wide `<svelte:head>` meta block in `src/routes/+layout.svelte` — title, description, canonical, Open Graph, Twitter card.
- Per-page `<svelte:head>` overrides on leaf routes (titles already follow `{Page} · {App}` convention).
- Favicon ecosystem — `favicon.svg`, `apple-touch-icon.png`, `site.webmanifest`.
- Dynamic `robots.txt` and `sitemap.xml` via `+server.ts` (origin-aware, no hardcoded host).
- JSON-LD structured data — `Organization` + `WebSite` at layout, page-specific schemas on content routes.
- Environment-gated `noindex` for staging/preview.

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

### R1 — Site-wide meta in root `+layout.svelte`, per-page overrides only when they differ

The root layout owns the default block. Leaf `<svelte:head>` overrides title (and description / OG image when they differ); it does NOT re-declare every tag. SvelteKit merges `<svelte:head>` content by last-write-wins for `<title>`, and accumulates other tags (which is why duplicate OG tags are dangerous — strip the layout default if a page sets its own).

✅ Layout pattern (full template in `references/meta-template.md`):

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import "../app.css";
	import { page } from "bosia/client";
	import { PUBLIC_SITE_ORIGIN } from "$env";
	import type { Snippet } from "svelte";

	let { children, data }: { children: Snippet; data: { seo?: SeoOverride } } = $props();

	const SITE = {
		name: "Komba",
		tagline: "Catatan ternak domba untuk peternakan menengah.",
		locale: "id_ID",
		themeColor: "#F5F1E8",
		ogImage: "/og-image.png",
	};

	const canonical = $derived(`${PUBLIC_SITE_ORIGIN}${page.url.pathname}`);
	const isProd = process.env.NODE_ENV === "production";

	type SeoOverride = { title?: string; description?: string; ogImage?: string };
	const seo = $derived(data?.seo ?? {});
	const description = $derived(seo.description ?? SITE.tagline);
	const ogImage = $derived(seo.ogImage ?? SITE.ogImage);
</script>

<svelte:head>
	<title>{seo.title ?? SITE.name}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />

	<meta name="application-name" content={SITE.name} />
	<meta name="apple-mobile-web-app-title" content={SITE.name} />
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="format-detection" content="telephone=no" />
	<meta name="theme-color" content={SITE.themeColor} />

	{#if !isProd}
		<meta name="robots" content="noindex,nofollow" />
	{/if}

	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={SITE.name} />
	<meta property="og:title" content={seo.title ?? `${SITE.name} — ${SITE.tagline}`} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={`${PUBLIC_SITE_ORIGIN}${ogImage}`} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:locale" content={SITE.locale} />
	<meta property="og:url" content={canonical} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={seo.title ?? SITE.name} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={`${PUBLIC_SITE_ORIGIN}${ogImage}`} />

	<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
	<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
	<link rel="manifest" href="/site.webmanifest" />
</svelte:head>
```

Per-page override (only when different from layout default):

```svelte
<!-- src/routes/(public)/login/+page.svelte -->
<svelte:head>
	<title>Masuk · Komba</title>
</svelte:head>
```

Loader-driven override (when the page needs a dynamic description):

```ts
// src/routes/(public)/onboarding/+page.server.ts
export const load = () => ({
	seo: {
		title: "Selamat datang · Komba",
		description: "Mulai catat ternak Anda dalam tiga langkah.",
	},
});
```

### R2 — Canonical URLs come from `PUBLIC_SITE_ORIGIN`, not `page.url.origin`

`page.url.origin` reflects the **incoming request host**. In production behind a reverse proxy with multiple hostnames (apex, staging, preview deploy), this leaks the wrong canonical to Google and splits your link equity. Always pin canonical to `PUBLIC_SITE_ORIGIN` from `$env`.

Set `PUBLIC_SITE_ORIGIN=https://app.example.com` in production env. In dev, set it to `http://localhost:5173`.

`og:url` follows the same rule.

### R3 — Dynamic `robots.txt` and `sitemap.xml` via `+server.ts`

Static files in `public/` work but hardcode the origin. Prefer server routes so the same build serves correct content per environment.

```ts
// src/routes/robots.txt/+server.ts
import type { RequestEvent } from "bosia";
import { PUBLIC_SITE_ORIGIN } from "$env";

const PRIVATE_PREFIXES = [
	"/api/",
	"/uploads/",
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
				`Sitemap: ${PUBLIC_SITE_ORIGIN}/sitemap.xml`,
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
import { PUBLIC_SITE_ORIGIN } from "$env";

const PUBLIC_PATHS = ["/", "/login", "/onboarding", "/forgot-password"] as const;

export function GET(_event: RequestEvent) {
	const now = new Date().toISOString().slice(0, 10);
	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PUBLIC_PATHS.map(
	(p) =>
		`  <url><loc>${PUBLIC_SITE_ORIGIN}${p}</loc><lastmod>${now}</lastmod><changefreq>monthly</changefreq></url>`,
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
- **URL**: must be absolute (`https://...`), not relative. The pattern above (`${PUBLIC_SITE_ORIGIN}${path}`) is correct.
- **Dynamic per-page OG** (Tier 3): expose `src/routes/og/[slug]/+server.ts` returning a generated PNG via Satori/Resvg or a server-side canvas lib. Out of scope for Tier 1.

### R6 — JSON-LD `Organization` + `WebSite` at layout, page-specific schemas on leaves

Use `<script type="application/ld+json">` inside `<svelte:head>`. SvelteKit emits the script as written — but escape any user-controlled strings to prevent XSS.

Helper:

```ts
// src/lib/seo/jsonld.ts
export function jsonLd(data: unknown): string {
	return JSON.stringify(data).replace(/</g, "\\u003c");
}
```

Layout block:

```svelte
<svelte:head>
	{@html `<script type="application/ld+json">${jsonLd({
		"@context": "https://schema.org",
		"@type": "Organization",
		name: SITE.name,
		url: PUBLIC_SITE_ORIGIN,
		logo: `${PUBLIC_SITE_ORIGIN}/logo-mark.svg`,
	})}</script>`}

	{@html `<script type="application/ld+json">${jsonLd({
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: SITE.name,
		url: PUBLIC_SITE_ORIGIN,
	})}</script>`}
</svelte:head>
```

(If a `SearchAction` is desired, add it to the `WebSite` object — only when a public `/search?q=` endpoint actually exists.)

Per-page (Tier 3) examples — Article, Product, FAQPage, BreadcrumbList — live in `references/meta-template.md`.

### R7 — `hreflang` only when BRIEF.md declares multiple locales

When BRIEF.md `Identity → Language` lists a single locale (most Bosia apps), skip `hreflang` — adding it with a single locale confuses Google. When multi-locale:

```svelte
<link rel="alternate" hreflang="id" href={`${PUBLIC_SITE_ORIGIN}/id${page.url.pathname}`} />
<link rel="alternate" hreflang="en" href={`${PUBLIC_SITE_ORIGIN}/en${page.url.pathname}`} />
<link rel="alternate" hreflang="x-default" href={`${PUBLIC_SITE_ORIGIN}${page.url.pathname}`} />
```

### R8 — Auth-gated apps still need Tier 1; sitemap lists only public surface

The single biggest mistake: skipping SEO entirely because "the app is auth-only." Anyone who shares a link to `/login` from WhatsApp expects a preview card.

For auth-gated apps:

- Tier 1: full meta on root layout (renders for `/login`, `/onboarding`, etc.).
- Tier 2: `robots.txt` disallows every private prefix; `sitemap.xml` lists only `/`, `/login`, `/onboarding`, `/forgot-password` (or whichever public routes exist).
- Canonical for private pages still points to the public origin (does not leak session info).

### R9 — Environment gate — staging emits `noindex`

Use the built-in `process.env.NODE_ENV` — Bosia's bundler inlines it at build time (via `define`), so it's safe on BOTH the SSR pass and the client bundle. Do NOT introduce a separate `PUBLIC_ENV` user var; that's a duplicate of what the framework already provides and risks drifting from `NODE_ENV`.

```svelte
<script lang="ts">
	const isProd = process.env.NODE_ENV === "production";
</script>

<svelte:head>
	{#if !isProd}
		<meta name="robots" content="noindex,nofollow" />
	{/if}
</svelte:head>
```

In `+server.ts` files (robots.txt, sitemap) the same `process.env.NODE_ENV === "production"` check works — server-side it's natively populated by `bosia dev` / `bosia build` / `bosia start`.

Pair with the dynamic `robots.txt` returning `Disallow: /` in non-prod (see R3). Both layers, since meta covers HTML and robots.txt covers crawl budget.

> Why not `PUBLIC_ENV`? Bosia's `.env` convention exposes `PUBLIC_*` vars via `$env` and inlines `process.env.NODE_ENV` separately. NODE_ENV is set automatically by the framework binary (`bosia dev` → `development`, `bosia build`/`start` → `production`); a hand-rolled `PUBLIC_ENV` is one more thing to keep in sync with no benefit.

### R10 — `<html lang>` lives in `src/app.html` via Bosia placeholder

Bosia's `src/app.html` should already use `lang="%bosia.lang%"`. The placeholder resolves from BRIEF.md `language`. If it shows `%bosia.lang%` unresolved or defaults to `en` despite BRIEF saying `id`, fix at the framework level — do not hardcode in `app.html`.

`bosia-brief-review` enforces this (its rule B-lang). When in doubt, grep:

```bash
grep -E 'lang="[a-z-]+"' src/app.html
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

| ❌ Anti-pattern                                              | ✅ Correct                                                             |
| ------------------------------------------------------------ | ---------------------------------------------------------------------- |
| `<title>Welcome</title>` only — no description               | Title + description + canonical at minimum                             |
| `og:image` is relative `/og.png`                             | Absolute `https://app.example.com/og.png`                              |
| Canonical from `page.url.origin`                             | Canonical from `PUBLIC_SITE_ORIGIN` env                                |
| Description > 160 chars                                      | ≤ 160 chars (Google truncates)                                         |
| Title > 60 chars                                             | ≤ 60 chars (Google truncates)                                          |
| OG image without declared width/height                       | Always include `og:image:width` / `og:image:height`                    |
| Hardcoded host in `robots.txt` / `sitemap.xml`               | Origin from `PUBLIC_SITE_ORIGIN`                                       |
| Staging deploys indexed by Google                            | `process.env.NODE_ENV` gate emitting `noindex` + `robots: Disallow: /` |
| Duplicate OG tags from layout + page both setting `og:image` | Page omits tags identical to layout; only override what differs        |
| JSON-LD with user content not escaped                        | `JSON.stringify(...).replace(/</g, "\\u003c")` helper                  |
| Marketing-quality OG image (5MB) shipped to every share      | ≤ 300KB                                                                |
| `og:locale=id` (wrong)                                       | `og:locale=id_ID` (BCP 47-ish; underscore, country code)               |
| `hreflang="id"` with no `x-default`                          | Always pair with `x-default` when multilingual                         |
| Skipping SEO because app is auth-gated                       | Tier 1 still required — share previews                                 |

## Workflow

1. **Read BRIEF.md** — capture name, tagline, language, theme color, audience locale.
2. **Audit current layout meta** — open `src/routes/+layout.svelte`; list what's already there.
3. **Inject Tier 1 block** — paste from `references/meta-template.md`, fill SITE constants from BRIEF.
4. **Add public assets** — `public/og-image.png` (1200×630, ≤300KB), `public/apple-touch-icon.png` (180×180), `public/site.webmanifest` (R4), optional `public/icon-512.png`.
5. **Add Tier 2 routes** — `src/routes/robots.txt/+server.ts` (R3), `src/routes/sitemap.xml/+server.ts` (R3).
6. **Set env** — add `PUBLIC_SITE_ORIGIN` to `.env`, `.env.example`. Per `bosia-env`.
7. **Add JSON-LD** — Organization + WebSite at layout (R6); per-page schemas only on content routes.
8. **Run checklist** — `references/checklist.md`. Cannot mark skill done until every box ticked.
9. **Verify** — see "Verification" below.

## Verification

After applying:

- **Source check** — `curl -s https://app/login | grep -E 'og:|twitter:|canonical|description'` returns ≥ 10 lines.
- **Open Graph validator** — paste prod URL into [opengraph.xyz](https://www.opengraph.xyz) → preview renders with image + tagline.
- **Twitter Card validator** — [cards-dev.twitter.com/validator](https://cards-dev.twitter.com/validator) (or post to a test thread) → large-image card renders.
- **Schema validator** — paste JSON-LD into [validator.schema.org](https://validator.schema.org) → zero errors.
- **robots / sitemap** — `curl -I https://app/robots.txt` returns 200 + `text/plain`; `curl -I https://app/sitemap.xml` returns 200 + `application/xml`.
- **Lighthouse** — SEO score ≥ 95 on any public page.
- **WhatsApp / Slack** — paste prod URL into a personal chat; preview card renders with image + tagline within ~3s.

## Bosia conventions

- `bosia-brief-review` — locks BRIEF.md `language` → `<html lang>` and `og:locale`.
- `bosia-routing` — `+server.ts` shape for `robots.txt` / `sitemap.xml`.
- `bosia-env` — `PUBLIC_SITE_ORIGIN` belongs in the `PUBLIC_` tier. For prod-vs-dev detection use the framework-managed `process.env.NODE_ENV` (inlined into the client bundle by Bosia's bundler), not a hand-rolled `PUBLIC_ENV`.
- `bosia-page-shell` — root `+layout.svelte` is the single source of truth for site-wide meta, mirroring chrome rule R1.
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
