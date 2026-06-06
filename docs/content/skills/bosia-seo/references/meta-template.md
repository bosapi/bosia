# bosia-seo — Meta template

Copy-paste blocks. Replace `{{NAME}}`, `{{TAGLINE}}`, `{{LOCALE}}`, `{{THEME_COLOR}}`, `{{OG_IMAGE_PATH}}` from BRIEF.md.

## 1. Root `+layout.svelte` — full Tier 1 + 2 block

```svelte
<script lang="ts">
	import "../app.css";
	import { page } from "bosia/client";
	import { PUBLIC_ENV, PUBLIC_SITE_ORIGIN } from "$env";
	import type { Snippet } from "svelte";
	import { jsonLd } from "$lib/seo/jsonld";

	type SeoOverride = {
		title?: string;
		description?: string;
		ogImage?: string;
		ogType?: "website" | "article" | "product";
	};

	let {
		children,
		data,
	}: {
		children: Snippet;
		data: { seo?: SeoOverride };
	} = $props();

	const SITE = {
		name: "{{NAME}}",
		tagline: "{{TAGLINE}}",
		locale: "{{LOCALE}}", // e.g. "id_ID", "en_US"
		themeColor: "{{THEME_COLOR}}", // e.g. "#F5F1E8"
		ogImage: "{{OG_IMAGE_PATH}}", // e.g. "/og-image.png"
	} as const;

	const canonical = $derived(`${PUBLIC_SITE_ORIGIN}${page.url.pathname}`);
	const isProd = PUBLIC_ENV === "production";
	const seo = $derived(data?.seo ?? {});
	const title = $derived(seo.title ?? SITE.name);
	const description = $derived(seo.description ?? SITE.tagline);
	const ogImageUrl = $derived(`${PUBLIC_SITE_ORIGIN}${seo.ogImage ?? SITE.ogImage}`);
	const ogType = $derived(seo.ogType ?? "website");

	const orgLd = jsonLd({
		"@context": "https://schema.org",
		"@type": "Organization",
		name: SITE.name,
		url: PUBLIC_SITE_ORIGIN,
		logo: `${PUBLIC_SITE_ORIGIN}/logo-mark.svg`,
	});

	const siteLd = jsonLd({
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: SITE.name,
		url: PUBLIC_SITE_ORIGIN,
	});
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />

	<meta name="application-name" content={SITE.name} />
	<meta name="apple-mobile-web-app-title" content={SITE.name} />
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="format-detection" content="telephone=no" />
	<meta name="theme-color" content={SITE.themeColor} />
	<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />

	{#if !isProd}
		<meta name="robots" content="noindex,nofollow" />
	{/if}

	<meta property="og:type" content={ogType} />
	<meta property="og:site_name" content={SITE.name} />
	<meta property="og:title" content={seo.title ?? `${SITE.name} — ${SITE.tagline}`} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={ogImageUrl} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:locale" content={SITE.locale} />
	<meta property="og:url" content={canonical} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={ogImageUrl} />

	<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
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

## 3. Per-page override patterns

### Static title override

```svelte
<!-- src/routes/(public)/login/+page.svelte -->
<svelte:head><title>Masuk · {{ NAME }}</title></svelte:head>
```

### Loader-driven override (dynamic description)

```ts
// src/routes/blog/[slug]/+page.server.ts
export async function load({ params }) {
	const post = await BlogService.bySlug(params.slug);
	return {
		post,
		seo: {
			title: `${post.title} · {{NAME}}`,
			description: post.excerpt,
			ogImage: `/og/${post.slug}.png`,
			ogType: "article" as const,
		},
	};
}
```

Layout reads `data.seo`; page-component renders content only.

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
	import { PUBLIC_SITE_ORIGIN } from "$env";

	const crumbs = $derived(page.url.pathname.split("/").filter(Boolean));
	const crumbLd = $derived(
		jsonLd({
			"@context": "https://schema.org",
			"@type": "BreadcrumbList",
			itemListElement: crumbs.map((slug, i) => ({
				"@type": "ListItem",
				position: i + 1,
				name: slug,
				item: `${PUBLIC_SITE_ORIGIN}/${crumbs.slice(0, i + 1).join("/")}`,
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
import type { RequestHandler } from "bosia";
import { PUBLIC_SITE_ORIGIN, PUBLIC_ENV } from "$env";

const PRIVATE_PREFIXES = [
	"/api/",
	"/uploads/",
	// app-specific private prefixes
];

export const GET: RequestHandler = () => {
	const isProd = PUBLIC_ENV === "production";
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
};
```

## 8. `src/routes/sitemap.xml/+server.ts`

```ts
import type { RequestHandler } from "bosia";
import { PUBLIC_SITE_ORIGIN } from "$env";

const PUBLIC_PATHS = ["/", "/login", "/onboarding", "/forgot-password"] as const;

export const GET: RequestHandler = () => {
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
};
```

## 9. `.env.example` additions

```
PUBLIC_SITE_ORIGIN=https://app.example.com
PUBLIC_ENV=development
```

In prod, set `PUBLIC_ENV=production` and point `PUBLIC_SITE_ORIGIN` at the canonical hostname.

## 10. Multilingual block (only when BRIEF declares multiple locales)

```svelte
{#each LOCALES as loc}
	<link
		rel="alternate"
		hreflang={loc.code}
		href={`${PUBLIC_SITE_ORIGIN}/${loc.prefix}${page.url.pathname}`}
	/>
{/each}
<link rel="alternate" hreflang="x-default" href={`${PUBLIC_SITE_ORIGIN}${page.url.pathname}`} />
```
