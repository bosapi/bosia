export type Locale = "en" | "id";

export function getLocale(slug: string): Locale {
	return slug.startsWith("id/") || slug === "id" ? "id" : "en";
}

export function stripLocale(slug: string): string {
	if (slug.startsWith("id/")) return slug.slice(3);
	if (slug === "id") return "";
	return slug;
}

export function localizeUrl(slug: string, locale: Locale): string {
	const base = slug === "" ? "/" : `/${slug}`;
	return locale === "id" ? `/id${base === "/" ? "" : base}` : base;
}

export function switchLocaleUrl(currentSlug: string): { locale: Locale; url: string } {
	const currentLocale = getLocale(currentSlug);
	const bare = stripLocale(currentSlug);
	if (currentLocale === "en") {
		return { locale: "id", url: bare === "" ? "/id" : `/id/${bare}` };
	}
	return { locale: "en", url: bare === "" ? "/" : `/${bare}` };
}
