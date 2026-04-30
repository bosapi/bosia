---
title: Server Metadata
description: Set page titles, meta tags, Open Graph, and lang attributes with the metadata() function.
---

The `metadata()` function lets you define SEO and head tags for each page, running on the server before `load()`.

## Basic Usage

Export a `metadata` function from `+page.server.ts`:

```ts
import type { MetadataEvent } from "bosia";

export function metadata({ params }: MetadataEvent) {
	return {
		title: "About — My App",
		description: "Learn more about our app.",
	};
}
```

This renders a `<title>` tag and a `<meta name="description">` tag in the page `<head>`.

## Open Graph & Social Tags

Use the `meta` array to add Open Graph, Twitter Card, or any custom meta tags:

```ts
export function metadata({ params }: MetadataEvent) {
	return {
		title: "Blog Post",
		description: "A great blog post.",
		meta: [
			{ property: "og:title", content: "Blog Post" },
			{ property: "og:description", content: "A great blog post." },
			{ property: "og:type", content: "article" },
			{ name: "twitter:card", content: "summary_large_image" },
		],
	};
}
```

Tags with `property` render as `<meta property="...">`, tags with `name` render as `<meta name="...">`.

## Language & Link Tags

Set the `<html lang>` attribute and add `<link>` tags for canonical URLs, hreflang alternates, and more:

```ts
export function metadata() {
	return {
		title: "Mon Blog",
		lang: "fr",
		link: [
			{ rel: "canonical", href: "https://example.com/blog" },
			{ rel: "alternate", href: "https://example.com/en/blog", hreflang: "en" },
			{ rel: "alternate", href: "https://example.com/fr/blog", hreflang: "fr" },
		],
	};
}
```

## Passing Data to load()

The `data` property lets you share fetched data with `load()`, avoiding duplicate queries:

```ts
import type { MetadataEvent, LoadEvent } from "bosia";

export function metadata({ params }: MetadataEvent) {
	const post = await db.getPost(params.slug);
	return {
		title: `${post.title} — Blog`,
		description: post.excerpt,
		meta: [{ property: "og:title", content: post.title }],
		// Pass to load() — avoids a second DB query
		data: { post },
	};
}

export async function load({ params, metadata }: LoadEvent) {
	// Reuse data from metadata(), fall back to fresh query
	const post = metadata?.post ?? (await db.getPost(params.slug));
	return { post };
}
```

The `data` object from `metadata()` becomes `event.metadata` in `load()`. If no `metadata()` function exists, `event.metadata` is `null`.

## MetadataEvent Properties

| Property  | Type                     | Description                                                                                                                            |
| --------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `params`  | `Record<string, string>` | Dynamic route parameters                                                                                                               |
| `url`     | `URL`                    | The request URL                                                                                                                        |
| `locals`  | `Record<string, any>`    | Data set by middleware hooks                                                                                                           |
| `cookies` | `Cookies`                | Read/write cookies                                                                                                                     |
| `fetch`   | `Function`               | Fetch helper (cookies forwarded same-origin only — see [Server Loaders → Cookie Forwarding](/guides/server-loaders#cookie-forwarding)) |

## Metadata Return Type

| Property      | Type                                                           | Description                                 |
| ------------- | -------------------------------------------------------------- | ------------------------------------------- |
| `title`       | `string`                                                       | Page `<title>` tag                          |
| `description` | `string`                                                       | `<meta name="description">` tag             |
| `meta`        | `Array<{ name?: string; property?: string; content: string }>` | Custom meta tags                            |
| `lang`        | `string`                                                       | `<html lang>` attribute                     |
| `link`        | `Array<{ rel: string; href: string; hreflang?: string }>`      | `<link>` tags (canonical, hreflang, etc.)   |
| `data`        | `Record<string, any>`                                          | Data passed to `load()` as `event.metadata` |

All properties are optional.

## Client-Side Navigation

During client-side navigation, Bosia sends `title` and `description` from `metadata()` in the data response. The client router automatically updates the document title and description meta tag without a full page reload.

## Timeouts

The `metadata()` function has a configurable timeout via the `METADATA_TIMEOUT` environment variable (in milliseconds). If `metadata()` takes too long, it times out gracefully and the page renders without metadata.

## Caching Interaction

If `metadata()` calls `cookies.get()` or `cookies.getAll()`, the data response is automatically marked with `Cache-Control: private, no-cache`. See [Server Loaders](/guides/server-loaders#caching) for details.
