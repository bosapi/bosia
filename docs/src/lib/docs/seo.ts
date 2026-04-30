import type { Locale } from "./i18n";
import { localizeUrl, switchLocaleUrl } from "./i18n";

const BASE_URL = "https://bosia.bosapi.com";
const SITE_NAME = "Bosia Docs";

export function buildSeoMeta({
	title,
	description,
	slug,
	locale,
}: {
	title: string;
	description: string;
	slug: string;
	locale: Locale;
}): {
	meta: Array<{ name?: string; property?: string; content: string }>;
	link: Array<{ rel: string; href: string; hreflang?: string }>;
	lang: string;
} {
	const url = `${BASE_URL}${localizeUrl(slug, locale)}`;
	const alt = switchLocaleUrl(locale === "id" ? `id/${slug}` : slug);
	const altUrl = `${BASE_URL}${alt.url}`;

	const meta: Array<{ name?: string; property?: string; content: string }> = [
		{ property: "og:type", content: "website" },
		{ property: "og:title", content: title },
		{ property: "og:description", content: description },
		{ property: "og:url", content: url },
		{ property: "og:site_name", content: SITE_NAME },
		{ property: "og:locale", content: locale === "id" ? "id_ID" : "en_US" },
		{ name: "twitter:card", content: "summary" },
		{ name: "twitter:title", content: title },
		{ name: "twitter:description", content: description },
	];

	const link: Array<{ rel: string; href: string; hreflang?: string }> = [
		{ rel: "canonical", href: url },
		{ rel: "alternate", href: url, hreflang: locale === "id" ? "id" : "en" },
		{ rel: "alternate", href: altUrl, hreflang: alt.locale },
		{ rel: "alternate", href: `${BASE_URL}${localizeUrl(slug, "en")}`, hreflang: "x-default" },
	];

	return { meta, link, lang: locale };
}
