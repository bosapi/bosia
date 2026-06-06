<!--
  Example: root +layout.svelte for an auth-gated Bosia app (Komba-style).
  Demonstrates Tier 1 + 2 wired against $env, $page, and a per-page `data.seo` override.
-->

<script lang="ts">
	import "../app.css";
	import { page } from "bosia/client";
	import { PUBLIC_SITE_ORIGIN } from "$env";
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
		name: "Komba",
		tagline: "Catatan ternak domba untuk peternakan menengah.",
		locale: "id_ID",
		themeColor: "#F5F1E8",
		ogImage: "/og-image.png",
	} as const;

	const canonical = $derived(`${PUBLIC_SITE_ORIGIN}${page.url.pathname}`);
	const isProd = process.env.NODE_ENV === "production";
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

<div class="mx-auto min-h-svh w-full max-w-[420px] bg-background text-foreground">
	{@render children()}
</div>
