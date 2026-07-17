import type { RequestEvent } from "bosia";
import { SEO, siteOrigin } from "../../features/seo/config";

export function GET({ request }: RequestEvent) {
	// block everything outside production so staging never gets indexed
	const isProd = process.env.NODE_ENV === "production";
	const body = isProd
		? [
				"User-agent: *",
				...SEO.privatePrefixes.map((p) => `Disallow: ${p}`),
				"Allow: /",
				"",
				`Sitemap: ${siteOrigin(request)}/sitemap.xml`,
			].join("\n")
		: "User-agent: *\nDisallow: /";

	return new Response(body, {
		headers: { "content-type": "text/plain; charset=utf-8" },
	});
}
