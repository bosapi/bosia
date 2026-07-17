---
title: SEO Routes
description: Ready-made /sitemap.xml, /robots.txt and /rss.xml routes served from one small config file.
---

The `seo` feature installs three crawler-facing routes — `/sitemap.xml`, `/robots.txt` and
`/rss.xml` — all fed by one config file you fill in. No database, no external services.

## Install

```bash
bun x bosia@latest feat seo
```

## What you get

| Path                                | Purpose                                          |
| ----------------------------------- | ------------------------------------------------ |
| `src/features/seo/config.ts`        | One config object: base URL, paths, feed entries |
| `src/routes/sitemap.xml/+server.ts` | Sitemap built from `publicPaths`                 |
| `src/routes/robots.txt/+server.ts`  | Allows public paths, blocks `privatePrefixes`    |
| `src/routes/rss.xml/+server.ts`     | RSS 2.0 feed built from `rssItems`               |

## Configure

Edit `src/features/seo/config.ts`:

```ts
export const SEO = {
	baseUrl: process.env.PUBLIC_BASE_URL || "",
	title: "My Site",
	description: "What this site is about.",
	publicPaths: ["/", "/blog", "/contact"],
	privatePrefixes: ["/api", "/dashboard"],
	rssItems: [],
};
```

Set `PUBLIC_BASE_URL` (e.g. `https://example.com`) in `.env` so crawlers get your canonical
origin; when empty, the routes fall back to the request origin. Outside production
(`NODE_ENV !== "production"`), `robots.txt` disallows everything so staging never gets indexed.

## Feeding the RSS feed

`rssItems` is a static list of `{ title, link, description?, pubDate? }`. If you installed the
[`blog` feature](/guides/blog/), map your posts into it inside `config.ts` — or replace the list
with a `PostRepository` call in `src/routes/rss.xml/+server.ts`.

## Meta tags are separate

These routes cover crawler plumbing only. Per-page `<title>`, descriptions, Open Graph and
Twitter cards come from `metadata()` in your `+page.server.ts` files — see the
[server metadata guide](/guides/server-metadata/).
