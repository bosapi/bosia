<!--
  Example: root +layout.svelte for a Bosia app (Komba-style).

  In Bosia the layout `<svelte:head>` is injected by a client-side hydration
  script (html.ts), so non-JS share scrapers never see it. Share-critical meta
  (title/description/canonical/OG/Twitter/robots) therefore lives in each route's
  metadata() in +page.server.ts — see metadata.ts / +page.server.ts below.

  This layout holds ONLY browser/PWA chrome + JSON-LD (Googlebot renders JS).
-->

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

<!--
  src/lib/seo/site.ts
  ───────────────────
  import { PUBLIC_STATIC_SITE_ORIGIN } from "$env";
  export const SITE = {
    name: "Komba",
    tagline: "Catatan ternak domba untuk peternakan menengah.",
    description: "Catat kelahiran, bobot, dan kesehatan domba dalam satu aplikasi.",
    locale: "id_ID",
    lang: "id",
    themeColor: "#F5F1E8",
    origin: PUBLIC_STATIC_SITE_ORIGIN,
    ogImage: "/og-image.png",
  } as const;

  src/routes/(public)/login/+page.server.ts
  ──────────────────────────────────────────
  import type { MetadataEvent } from "bosia";
  import { buildPageMeta } from "$lib/seo/metadata.ts";
  export function metadata({ url }: MetadataEvent) {
    return buildPageMeta({ title: "Masuk", description: "Masuk ke akun Komba.", path: url.pathname });
  }

  (buildPageMeta lives in metadata.ts — see SKILL.md R1.)
-->

<div class="mx-auto min-h-svh w-full max-w-[420px] bg-background text-foreground">
	{@render children()}
</div>
