---
name: bosia-web
description: Look up live web info via web_search (Tavily/SearXNG/DuckDuckGo, keyword-cached) and pull a specific URL/domain/IP to readable markdown via web_fetch — SSRF-safe.
triggers:
    - search the web
    - search web
    - look up
    - lookup
    - research
    - latest
    - current
    - news
    - fetch url
    - fetch website
    - fetch domain
    - scrape
    - google
    - berita
    - cari di internet
    - cari di web
od:
    mode: convention
    category: framework
bosia:
    design: false
    requires:
        blocks: []
        themes: []
        components: []
        feats: []
    targets:
        routes: []
    stack: [svelte-runes]
---

# bosia-web

## What it covers

- Calling `web_search` to get keyword results from the live web.
- Calling `web_fetch` to pull readable markdown from a specific URL, bare domain, or IP literal.
- Understanding the cache + provider fallback so quota stays low.
- Knowing what's blocked (private/loopback addresses).

## When to use

- Brief mentions a real product/library/event the model may not know fresh (e.g. "use the latest Svelte 5 release notes", "list top 5 Indonesian indie coffee brands").
- User asks for current news, prices, docs, or any "today/this week" question.
- User gives an URL and wants info pulled from it.

## When NOT to use

- The answer is stable and in training data (basic syntax, well-known APIs) — don't burn quota.
- Tenant code shouldn't call out to the network from inside the app — these tools run in bosapi, not in the user's app. Don't ask the user to wire `fetch('https://api…')` into their tenant; tenant apps are network-denied by policy.
- Image search → use [[bosia-image-external]] (different cache, different providers).

## Rules

### R1 — Search first, fetch second

Always call `web_search({ keyword })` before `web_fetch` unless the user gave a specific URL. Pick the most relevant result, then fetch ONLY that URL if you need the page body.

```ts
web_search({ keyword: "svelte 5 runes", count: 5 });
// → pick result.url, then:
web_fetch({ url: "https://svelte.dev/docs/svelte/what-are-runes" });
```

### R2 — Cache-friendly keywords

- Lowercase, short, no surrounding quotes.
- Good: `"svelte 5 runes"`, `"jakarta minimum wage 2026"`.
- Bad: `"What is the latest Svelte 5 release date?"` (too long, never cache-hits).

Repeat queries with the same normalized keyword are served from the bosapi DB for 7 days — no provider call, no quota burned.

### R3 — Provider fallback is automatic

`provider: "auto"` (default) tries Tavily → SearXNG → DuckDuckGo, skipping any provider that isn't configured. DuckDuckGo needs no key, so the tool always returns something even on a fresh install. Only pin a specific provider when you're debugging quota.

Provider config:

- Tavily (`BOSAPI_TAVILY_API_KEY`) — free 1k queries/mo, AI-tuned, best quality.
- SearXNG (`BOSAPI_SEARXNG_URL`) — point at any SearXNG instance (e.g. `https://searx.be`); no key, but public instances rate-limit.
- DuckDuckGo HTML — no env at all, always on as last resort.

### R4 — `web_fetch` blocks private addresses

The tool refuses `127.0.0.0/8`, `10/8`, `172.16/12`, `192.168/16`, `169.254/16` (incl. cloud metadata `169.254.169.254`), `::1`, `fc00::/7`, and hostnames `localhost`, `*.localhost`, `*.local`, `*.internal`. If `ok: false` with `"blocked …"` shows up, do NOT try to bypass — surface the block to the user and stop.

### R5 — Cite the source

When you take a fact from `web_search` / `web_fetch` and surface it into the app (text, copy, prices), keep the source URL nearby — either in a comment, a "Source:" line, or stored in DB. The user must be able to verify.

### R6 — Truncation

`web_fetch` output is capped at 50 KB. If `truncated: true`, the page tail was dropped. Look for a smaller URL (a specific section, an API endpoint) instead of re-fetching the same page.

## Return shapes

```ts
// web_search
{
  ok: true,
  source: "cache" | "fresh" | "mixed",
  results: Array<{
    title: string;
    url: string;
    snippet: string | null;
    provider: "tavily" | "searxng" | "duckduckgo";
  }>;
}

// web_fetch
{
  ok: true,
  url: string;             // final URL after redirect
  title: string | null;
  contentType: string;
  markdown: string;        // capped at 50 KB
  truncated: boolean;
}
```

Error shape for both: `{ ok: false, error: string }`. `source: "cache"` means no upstream call was made — useful when checking quota.
