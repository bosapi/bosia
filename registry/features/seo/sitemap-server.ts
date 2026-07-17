import type { RequestEvent } from "bosia";
import { SEO, siteOrigin } from "../../features/seo/config";

export function GET({ request }: RequestEvent) {
	const origin = siteOrigin(request);
	const now = new Date().toISOString().slice(0, 10);
	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${SEO.publicPaths
	.map((p) => `  <url><loc>${origin}${p}</loc><lastmod>${now}</lastmod></url>`)
	.join("\n")}
</urlset>`;

	return new Response(body, {
		headers: { "content-type": "application/xml; charset=utf-8" },
	});
}
