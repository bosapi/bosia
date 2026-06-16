import { docExists } from "./content";
import type { Locale } from "./i18n";
import { localizeUrl, switchLocaleUrl } from "./i18n";

const BASE_URL = "https://bosia.dev";
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

	// Only emit hreflang annotations when both language versions actually exist,
	// otherwise we point Google at a 404 (most EN pages have no ID translation).
	const idSlug = slug === "" ? "id" : `id/${slug}`;
	const enExists = locale === "en" ? true : docExists(slug);
	const idExists = locale === "id" ? true : docExists(idSlug);
	const hasCluster = enExists && idExists;

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
	];
	if (hasCluster) {
		link.push(
			{ rel: "alternate", href: url, hreflang: locale === "id" ? "id" : "en" },
			{ rel: "alternate", href: altUrl, hreflang: alt.locale },
			{ rel: "alternate", href: `${BASE_URL}${localizeUrl(slug, "en")}`, hreflang: "x-default" },
		);
	}

	return { meta, link, lang: locale };
}
