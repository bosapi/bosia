// Fill this in for your site — it feeds /sitemap.xml, /robots.txt and /rss.xml.
export const SEO = {
	// canonical origin, e.g. "https://example.com"; falls back to the request origin when empty
	baseUrl: process.env.PUBLIC_BASE_URL || "",
	title: "My Site",
	description: "What this site is about.",
	// every genuinely public route; add /blog etc. as you ship them
	publicPaths: ["/"],
	// route prefixes crawlers should skip
	privatePrefixes: ["/api"],
	// static feed entries; map your posts here if you install the blog feature
	rssItems: [] as {
		title: string;
		link: string;
		description?: string;
		pubDate?: Date;
	}[],
};

export function siteOrigin(request: Request): string {
	return SEO.baseUrl || new URL(request.url).origin;
}
