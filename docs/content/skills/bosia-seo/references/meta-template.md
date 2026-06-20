# bosia-seo — Meta template

Copy-paste blocks. Replace `{{NAME}}`, `{{TAGLINE}}`, `{{DESCRIPTION}}`, `{{LOCALE}}`, `{{LANG}}`, `{{THEME_COLOR}}`, `{{OG_IMAGE_PATH}}` from BRIEF.md.

> Bosia note: share-critical meta is built per-route by `metadata()` (server-rendered raw `<head>`), NOT in the layout `<svelte:head>` (client-injected, scrapers miss it). See SKILL.md R1.

## 0. SEO lib — `src/lib/seo/site.ts`

```ts
import { PUBLIC_STATIC_SITE_ORIGIN } from "$env";

export const SITE = {
	name: "{{NAME}}",
	tagline: "{{TAGLINE}}",
	description: "{{DESCRIPTION}}", // default meta description, ≤160 chars
	locale: "{{LOCALE}}", // og:locale, e.g. "id_ID", "en_US"
	lang: "{{LANG}}", // <html lang> + JSON-LD inLanguage, e.g. "id"
	themeColor: "{{THEME_COLOR}}", // e.g. "#F5F1E8"
	origin: PUBLIC_STATIC_SITE_ORIGIN, // never the request host — SKILL.md R2
	ogImage: "{{OG_IMAGE_PATH}}", // e.g. "/og-image.png"
} as const;
```

## 1. `src/lib/seo/metadata.ts` — the per-route builder

```ts
import type { Metadata } from "bosia";
import { SITE } from "./site.ts";

type PageMetaArgs = {
	title?: string; // omit on home for the brand title
	description?: string; // ≤160 chars; falls back to SITE.description
	path: string; // always url.pathname
	ogImage?: string;
	ogType?: "website" | "article" | "product";
	noindex?: boolean;
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

## 1b. Root `+layout.svelte` — chrome + JSON-LD only

```svelte
<script lang="ts">
	import "../app.css";
	import { SITE } from "$lib/seo/site.ts";
	import { jsonLd } from "$lib/seo/jsonld.ts";
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();

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

## 2. JSON-LD escape helper

```ts
// src/lib/seo/jsonld.ts
export function jsonLd(data: unknown): string {
	return JSON.stringify(data).replace(/</g, "\\u003c");
}
```

## 3. Per-page `metadata()` — one per leaf route (`+page.server.ts`)

### Static route

```ts
// src/routes/(public)/login/+page.server.ts
import type { MetadataEvent } from "bosia";
import { buildPageMeta } from "$lib/seo/metadata.ts";

export function metadata({ url }: MetadataEvent) {
	return buildPageMeta({
		title: "Masuk",
		description: "Masuk ke akun {{NAME}}.",
		path: url.pathname,
	});
}
```

### Private / auth-gated route — add `noindex`

```ts
// src/routes/(private)/dashboard/+page.server.ts
import type { MetadataEvent } from "bosia";
import { buildPageMeta } from "$lib/seo/metadata.ts";

export function metadata({ url }: MetadataEvent) {
	return buildPageMeta({
		title: "Dasbor",
		description: "Ringkasan akunmu.",
		path: url.pathname,
		noindex: true,
	});
}
```

### Dynamic route — derive from `params`

```ts
// src/routes/blog/[slug]/+page.server.ts (no DB? just read params/static map)
import type { MetadataEvent } from "bosia";
import { buildPageMeta } from "$lib/seo/metadata.ts";

export function metadata({ params, url }: MetadataEvent) {
	return buildPageMeta({ title: params.slug, path: url.pathname, ogType: "article" });
}
```

For a dynamic route that needs DB data for the title/description, see §3b (fetch once in `metadata()`, share with `load()`).

## 3b. Per-page override that needs DB data — share between `metadata()` and `load()`

Fetch ONCE in `metadata()`, pass via `data:` so `load()` does not refetch.

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
		data: { post }, // <-- shared with load()
	};
}

export async function load({ params, metadata }: LoadEvent) {
	// Reuse what metadata() already fetched; fallback if metadata() timed out.
	const post = metadata?.post ?? (await BlogService.bySlug(params.slug));
	if (!post) error(404, "Post not found");
	return { post };
}
```

## 4. Per-page Article JSON-LD (Tier 3)

```svelte
<script lang="ts">
	import { jsonLd } from "$lib/seo/jsonld";
	let { data } = $props();
	const articleLd = jsonLd({
		"@context": "https://schema.org",
		"@type": "Article",
		headline: data.post.title,
		description: data.post.excerpt,
		datePublished: data.post.publishedAt,
		dateModified: data.post.updatedAt,
		author: { "@type": "Person", name: data.post.authorName },
		image: data.seo.ogImage,
	});
</script>

<svelte:head>
	{@html `<script type="application/ld+json">${articleLd}</script>`}
	<meta property="article:published_time" content={data.post.publishedAt} />
	<meta property="article:author" content={data.post.authorName} />
</svelte:head>
```

## 5. BreadcrumbList JSON-LD (Tier 3)

```svelte
<script lang="ts">
	import { page } from "bosia/client";
	import { jsonLd } from "$lib/seo/jsonld";
	import { SITE } from "$lib/seo/site.ts";

	const crumbs = $derived(page.url.pathname.split("/").filter(Boolean));
	const crumbLd = $derived(
		jsonLd({
			"@context": "https://schema.org",
			"@type": "BreadcrumbList",
			itemListElement: crumbs.map((slug, i) => ({
				"@type": "ListItem",
				position: i + 1,
				name: slug,
				item: `${SITE.origin}/${crumbs.slice(0, i + 1).join("/")}`,
			})),
		}),
	);
</script>

<svelte:head>{@html `<script type="application/ld+json">${crumbLd}</script>`}</svelte:head>
```

## 6. `public/site.webmanifest`

```json
{
	"name": "{{NAME}}",
	"short_name": "{{NAME}}",
	"description": "{{TAGLINE}}",
	"start_url": "/",
	"scope": "/",
	"display": "standalone",
	"background_color": "{{THEME_COLOR}}",
	"theme_color": "{{THEME_COLOR}}",
	"lang": "{{LANG_CODE}}",
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

## 7. `src/routes/robots.txt/+server.ts`

```ts
import type { RequestEvent } from "bosia";
import { SITE } from "$lib/seo/site.ts";

// Route groups like (private) are stripped from URLs — list the REAL prefixes.
const PRIVATE_PREFIXES = [
	"/dashboard",
	"/api",
	// app-specific private prefixes
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

## 8. `src/routes/sitemap.xml/+server.ts`

```ts
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

## 9. `.env` / `.env.example` additions

```
# Build-time inlined (PUBLIC_STATIC_*), available on SSR + client.
PUBLIC_STATIC_SITE_ORIGIN=http://localhost:9000
```

In `.env.production`, point `PUBLIC_STATIC_SITE_ORIGIN` at the canonical hostname (`https://app.example.com`). Bosia sets `NODE_ENV=production` automatically when you run `bosia build` / `bosia start` — no extra env var is needed for the prod gate.

## 10. Multilingual block (only when BRIEF declares multiple locales)

```svelte
{#each LOCALES as loc}
	<link
		rel="alternate"
		hreflang={loc.code}
		href={`${SITE.origin}/${loc.prefix}${page.url.pathname}`}
	/>
{/each}
<link rel="alternate" hreflang="x-default" href={`${SITE.origin}${page.url.pathname}`} />
```
