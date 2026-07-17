import type { RequestEvent } from "bosia";
import { SEO, siteOrigin } from "../../features/seo/config";

function escapeXml(s: string): string {
	return s
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;");
}

export function GET({ request }: RequestEvent) {
	const origin = siteOrigin(request);
	const items = SEO.rssItems
		.map((item) => {
			const link = item.link.startsWith("http") ? item.link : `${origin}${item.link}`;
			return [
				"    <item>",
				`      <title>${escapeXml(item.title)}</title>`,
				`      <link>${escapeXml(link)}</link>`,
				`      <guid>${escapeXml(link)}</guid>`,
				item.description ? `      <description>${escapeXml(item.description)}</description>` : "",
				item.pubDate ? `      <pubDate>${item.pubDate.toUTCString()}</pubDate>` : "",
				"    </item>",
			]
				.filter(Boolean)
				.join("\n");
		})
		.join("\n");

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(SEO.title)}</title>
    <link>${escapeXml(origin)}</link>
    <description>${escapeXml(SEO.description)}</description>
${items}
  </channel>
</rss>`;

	return new Response(body, {
		headers: { "content-type": "application/rss+xml; charset=utf-8" },
	});
}
