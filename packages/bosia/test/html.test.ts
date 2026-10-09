import { describe, expect, test } from "bun:test";
import {
	safeJsonStringify,
	safeJsonForScript,
	escapeHtml,
	escapeAttr,
	isStaticPath,
	safeLang,
	buildHtml,
	buildHtmlTail,
	buildHtmlShellOpen,
	buildMetadataChunk,
	metadataTags,
	distManifest,
	getPublicDynamicEnv,
	hasTitle,
} from "../src/core/html.ts";
import type { AppHtmlSegments } from "../src/core/appHtml.ts";
import type { Metadata } from "../src/core/hooks.ts";

describe("safeJsonStringify", () => {
	test("escapes <, >, & for script-context safety", () => {
		const out = safeJsonStringify({ x: "</script><script>alert(1)" });
		expect(out).not.toContain("</script>");
		expect(out).toContain("\\u003c");
		expect(out).toContain("\\u003e");
	});

	test("escapes ampersand", () => {
		expect(safeJsonStringify("a&b")).toContain("\\u0026");
	});

	test("escapes U+2028 and U+2029", () => {
		const out = safeJsonStringify("a\u2028b\u2029c");
		expect(out).toContain("\\u2028");
		expect(out).toContain("\\u2029");
	});

	test("survives circular reference", () => {
		const a: any = {};
		a.self = a;
		const original = console.error;
		console.error = () => {};
		try {
			expect(safeJsonStringify(a)).toBe("null");
		} finally {
			console.error = original;
		}
	});
});

describe("safeJsonForScript", () => {
	test("returns valid JSON parseable by JSON.parse", () => {
		const data = { a: 1, b: "hello", c: [true, null, 2.5] };
		const out = safeJsonForScript(data);
		expect(JSON.parse(out)).toEqual(data);
	});

	test("escapes </script> inside string values", () => {
		const out = safeJsonForScript({ x: "</script><script>alert(1)</script>" });
		expect(out.toLowerCase()).not.toContain("</script");
		expect(out).toContain("\\u003c/script");
		expect(JSON.parse(out).x).toBe("</script><script>alert(1)</script>");
	});

	test("escapes <!-- inside string values", () => {
		const out = safeJsonForScript({ x: "before<!--comment-->after" });
		expect(out).not.toContain("<!--");
		expect(out).toContain("\\u003c!--");
		expect(JSON.parse(out).x).toBe("before<!--comment-->after");
	});

	test("leaves clean HTML-free payloads byte-identical to JSON.stringify", () => {
		const data = { a: 1, b: "hello world", c: [true, null, 2.5], d: { nested: "ok" } };
		expect(safeJsonForScript(data)).toBe(JSON.stringify(data));
	});

	test("survives circular reference", () => {
		const a: any = {};
		a.self = a;
		const original = console.error;
		console.error = () => {};
		try {
			expect(safeJsonForScript(a)).toBe("null");
		} finally {
			console.error = original;
		}
	});
});

describe("escapeHtml", () => {
	test("escapes & < >", () => {
		expect(escapeHtml("a & <b> c")).toBe("a &amp; &lt;b&gt; c");
	});
});

describe("escapeAttr", () => {
	test("escapes & < > and double-quote", () => {
		expect(escapeAttr(`"a"<b>&c`)).toBe("&quot;a&quot;&lt;b&gt;&amp;c");
	});
});

describe("isStaticPath", () => {
	test("dist + __bosia paths", () => {
		expect(isStaticPath("/dist/client/x.js")).toBe(true);
		expect(isStaticPath("/__bosia/sse")).toBe(true);
	});

	test("static extensions", () => {
		expect(isStaticPath("/foo.css")).toBe(true);
		expect(isStaticPath("/foo.js")).toBe(true);
		expect(isStaticPath("/img/logo.png")).toBe(true);
		expect(isStaticPath("/favicon.ico")).toBe(true);
		expect(isStaticPath("/search-index.json")).toBe(true);
	});

	test("non-static paths", () => {
		expect(isStaticPath("/about")).toBe(false);
		expect(isStaticPath("/")).toBe(false);
		expect(isStaticPath("/api/users")).toBe(false);
	});
});

describe("buildHtml — JSON-island loader payloads", () => {
	test("emits page+layout+form islands before the module hydration script", () => {
		const html = buildHtml(
			"<p>hi</p>",
			"",
			{ greeting: "hi" },
			[{ layout: 1 }],
			true,
			{ formField: "v" },
			"en",
			true,
		);
		const pageIdx = html.indexOf(`id="__bosia-page-data__"`);
		const layoutIdx = html.indexOf(`id="__bosia-layout-data__"`);
		const formIdx = html.indexOf(`id="__bosia-form-data__"`);
		const moduleIdx = html.indexOf(`type="module"`);
		expect(pageIdx).toBeGreaterThan(0);
		expect(layoutIdx).toBeGreaterThan(pageIdx);
		expect(formIdx).toBeGreaterThan(layoutIdx);
		expect(moduleIdx).toBeGreaterThan(formIdx);
		expect(html).not.toContain("window.__BOSIA_PAGE_DATA__");
		expect(html).not.toContain("window.__BOSIA_LAYOUT_DATA__");
		expect(html).not.toContain("window.__BOSIA_FORM_DATA__");
	});

	test("omits form-data island when formData is null", () => {
		const html = buildHtml("", "", {}, [], true, null, "en", true);
		expect(html).toContain(`id="__bosia-page-data__"`);
		expect(html).toContain(`id="__bosia-layout-data__"`);
		expect(html).not.toContain(`id="__bosia-form-data__"`);
	});

	test("emits no JSON islands when csr=false", () => {
		const html = buildHtml("", "", { x: 1 }, [], false, null, "en", true);
		expect(html).not.toContain(`id="__bosia-page-data__"`);
		expect(html).not.toContain(`id="__bosia-layout-data__"`);
	});

	test("XSS payload in pageData is escaped, no executable </script> emitted", () => {
		const html = buildHtml(
			"",
			"",
			{ evil: "</script><script>alert(1)</script>" },
			[],
			true,
			null,
			"en",
			true,
		);
		const start = html.indexOf(`id="__bosia-page-data__"`);
		const end = html.indexOf("</script>", start);
		const island = html.slice(start, end);
		expect(island.toLowerCase()).not.toContain("</script");
		expect(island).toContain("\\u003c/script");
	});
});

describe("buildHtmlTail — JSON-island loader payloads", () => {
	test("emits page+layout+form islands before the module hydration script", () => {
		const tail = buildHtmlTail("", { a: 1 }, [{ b: 2 }], true, { formField: "v" }, true);
		const pageIdx = tail.indexOf(`id="__bosia-page-data__"`);
		const layoutIdx = tail.indexOf(`id="__bosia-layout-data__"`);
		const formIdx = tail.indexOf(`id="__bosia-form-data__"`);
		const moduleIdx = tail.indexOf(`type="module"`);
		expect(pageIdx).toBeGreaterThan(0);
		expect(layoutIdx).toBeGreaterThan(pageIdx);
		expect(formIdx).toBeGreaterThan(layoutIdx);
		expect(moduleIdx).toBeGreaterThan(formIdx);
	});
});

describe("metadataTags", () => {
	const full: Metadata = {
		title: "Judul & <b>",
		description: 'Ringkasan "kutip"',
		meta: [
			{ name: "twitter:card", content: "summary" },
			{ property: "og:title", content: "OG <judul>" },
		],
		link: [
			{ rel: "canonical", href: "https://x.test/a?a=1&b=2" },
			{ rel: "alternate", href: "https://x.test/en", hreflang: "en" },
		],
	};

	test("null metadata emits nothing — the fallback belongs to the callers", () => {
		expect(metadataTags(null)).toBe("");
	});

	test("emits title, description, both meta forms and link, all escaped", () => {
		const out = metadataTags(full);
		expect(out).toContain("<title>Judul &amp; &lt;b&gt;</title>");
		expect(out).toContain(
			`<meta name="description" content="Ringkasan &quot;kutip&quot;" data-bosia-meta>`,
		);
		expect(out).toContain(`<meta name="twitter:card" content="summary" data-bosia-meta>`);
		expect(out).toContain(`<meta property="og:title" content="OG &lt;judul&gt;" data-bosia-meta>`);
		expect(out).toContain(
			`<link rel="canonical" href="https://x.test/a?a=1&amp;b=2" data-bosia-meta>`,
		);
		expect(out).toContain(
			`<link rel="alternate" href="https://x.test/en" hreflang="en" data-bosia-meta>`,
		);
	});

	test("every metadata()-owned tag carries the stamp the client router replaces on", () => {
		const lines = metadataTags(full).trim().split("\n");
		const tagged = lines.filter((l) => l.includes("<meta ") || l.includes("<link "));
		expect(tagged).toHaveLength(5); // description + 2 meta + 2 link
		for (const l of tagged) expect(l).toContain("data-bosia-meta");
		// The title is synced via document.title, so it is deliberately unstamped.
		expect(lines.find((l) => l.includes("<title>"))).not.toContain("data-bosia-meta");
	});

	test("buildMetadataChunk output is unchanged by the extraction", () => {
		expect(buildMetadataChunk(null).startsWith("\n  <title>Bosia App</title>\n</head>")).toBe(true);
		expect(buildMetadataChunk(full).startsWith("\n" + metadataTags(full))).toBe(true);
	});

	test("<svelte:head> output lands in the real <head>, not a script", () => {
		const ld = `<script type="application/ld+json">{"@type":"Organization"}</script>`;
		const chunk = buildMetadataChunk({ title: "X" }, { head: ld });
		expect(chunk.indexOf(ld)).toBeGreaterThan(-1);
		expect(chunk.indexOf(ld)).toBeLessThan(chunk.indexOf("</head>"));
		expect(buildHtmlTail("", {}, [], true)).not.toContain("insertAdjacentHTML");
	});

	test("fallback title only when neither metadata() nor <svelte:head> has one", () => {
		expect(buildMetadataChunk(null, { head: "<title>Head</title>" })).not.toContain("Bosia App");
		expect(buildMetadataChunk({ description: "d" })).toContain("<title>Bosia App</title>");
	});

	test("a plugin head title suppresses the fallback", () => {
		const chunk = buildMetadataChunk({ description: "d" }, { headExtras: ["<title>Shop</title>"] });
		expect(chunk).not.toContain("Bosia App");
		expect(chunk).toContain("<title>Shop</title>");
	});

	test("hasTitle sees attributed titles but not an inline SVG's", () => {
		expect(hasTitle(`<title data-x="1">Shop</title>`)).toBe(true);
		expect(hasTitle(`<TITLE>Shop</TITLE>`)).toBe(true);
		expect(hasTitle(`<svg><title>icon</title></svg>`)).toBe(false);
		expect(hasTitle(`<meta name="titles" content="x">`)).toBe(false);
		expect(hasTitle(`<!-- <title>Old</title> -->`)).toBe(false);
		expect(hasTitle(`<script type="application/ld+json">{"x":"<title>"}</script>`)).toBe(false);
		expect(hasTitle(`<noscript><title>x</title></noscript>`)).toBe(false);
		expect(hasTitle(`<script>x</script><title>Real</title>`)).toBe(true);
		expect(hasTitle(`<scripts><title>Real</title>`)).toBe(true);
		expect(hasTitle(`<!-- open comment <title>x</title>`)).toBe(false);
	});

	test("hasTitle stays linear on many unclosed <script openings", () => {
		const hostile = "<script ".repeat(20_000) + "<title>x</title>";
		const start = performance.now();
		hasTitle(hostile);
		expect(performance.now() - start).toBeLessThan(50);
	});

	test("streaming and buildHtml order metadata, headExtras, <svelte:head> the same", () => {
		const meta: Metadata = { title: "T", description: "D" };
		const extra = `<link rel="canonical" href="https://x.test/">`;
		const head = `<meta name="from-head" content="1">`;
		const order = (html: string) =>
			["<title>T</title>", 'name="description"', extra, head].map((s) => html.indexOf(s));
		const streamed = order(
			buildHtmlShellOpen("en") + buildMetadataChunk(meta, { headExtras: [extra], head }),
		);
		const buffered = order(
			buildHtml(
				"",
				head,
				{},
				[],
				true,
				null,
				"en",
				true,
				undefined,
				null,
				null,
				undefined,
				undefined,
				meta,
				undefined,
				[extra],
			),
		);
		for (const o of [streamed, buffered]) {
			expect(o.every((i) => i > -1)).toBe(true);
			expect([...o].sort((a, b) => a - b)).toEqual(o);
		}
	});
});

describe("buildHtml — metadata argument", () => {
	const meta: Metadata = { title: "Kontak", description: "Hubungi kami" };

	test("emits the metadata title and drops the Bosia App fallback", () => {
		const html = buildHtml(
			"",
			"",
			{},
			[],
			true,
			null,
			"id",
			true,
			undefined,
			null,
			null,
			undefined,
			undefined,
			meta,
		);
		expect(html).toContain("<title>Kontak</title>");
		expect(html).toContain(`<meta name="description" content="Hubungi kami" data-bosia-meta>`);
		expect(html).not.toContain("Bosia App");
		expect(html).toContain('lang="id"');
	});

	test("metadata title precedes a <svelte:head> title — first one wins", () => {
		const html = buildHtml(
			"",
			"<title>Dari svelte:head</title>",
			{},
			[],
			true,
			null,
			"en",
			true,
			undefined,
			null,
			null,
			undefined,
			undefined,
			meta,
		);
		expect(html.indexOf("<title>Kontak</title>")).toBeLessThan(
			html.indexOf("<title>Dari svelte:head</title>"),
		);
		expect(html).not.toContain("Bosia App");
	});

	test("null metadata with a <title> in head keeps the existing no-fallback behavior", () => {
		const html = buildHtml("", "<title>Head</title>", {}, [], true, null, "en", true);
		expect(html).not.toContain("Bosia App");
	});

	test("neither metadata nor a head title still falls back", () => {
		expect(buildHtml("", "", {}, [], true, null, "en", true)).toContain("<title>Bosia App</title>");
	});
});

describe("tailwind stylesheet link", () => {
	test("uses hashed /dist/client/ link without cache buster when manifest.tw is set", () => {
		distManifest.tw = "bosia-tw-abcdef1234.css";
		try {
			const html = buildHtml("", "", {}, [], true, null, "en", true);
			expect(html).toContain(`<link rel="stylesheet" href="/dist/client/bosia-tw-abcdef1234.css">`);
			expect(html).not.toContain("/bosia-tw.css");
			expect(buildHtmlShellOpen("en")).toContain("/dist/client/bosia-tw-abcdef1234.css");
		} finally {
			delete distManifest.tw;
		}
	});

	test("component stylesheet is linked AFTER tailwind on both render paths", () => {
		distManifest.tw = "bosia-tw-abcdef1234.css";
		distManifest.css = ["bosia-css-0123456789.css"];
		try {
			// Scoped rules used to be appended to document.head at hydration, i.e.
			// last. The app stylesheets Tailwind inlines are unlayered, so linking
			// the component sheet first would flip which side wins a tie.
			for (const html of [
				buildHtml("", "", {}, [], true, null, "en", true),
				buildHtmlShellOpen("en"),
			]) {
				expect(html).toContain("bosia-css-0123456789.css");
				expect(html.indexOf("bosia-css-0123456789.css")).toBeGreaterThan(
					html.indexOf("bosia-tw-abcdef1234.css"),
				);
			}
		} finally {
			delete distManifest.tw;
			distManifest.css = [];
		}
	});

	test("an app with no scoped styles links no component stylesheet", () => {
		expect(distManifest.css).toEqual([]);
		expect(buildHtml("", "", {}, [], true, null, "en", true)).not.toContain("bosia-css-");
		expect(buildHtmlShellOpen("en")).not.toContain("bosia-css-");
	});

	test("falls back to /bosia-tw.css when manifest.tw is absent", () => {
		expect(buildHtml("", "", {}, [], true, null, "en", true)).toContain(`href="/bosia-tw.css`);
		expect(buildHtmlShellOpen("en")).toContain(`href="/bosia-tw.css`);
	});
});

describe("client entry URL", () => {
	// Split chunks import the entry as a bare `./hydrate-*.js`. Any query on the
	// page's copy (e.g. a dev `?v=`) loads it twice → two Svelte runtimes and a
	// dead hydration. Tests run with isDev true, so this covers the dev path.
	test("script and modulepreload use the bare entry URL on every render path", () => {
		const entry = `/dist/client/${distManifest.entry}`;
		for (const html of [
			buildHtml("", "", {}, [], true, null, "en", true),
			buildHtmlShellOpen("en"),
			buildHtmlTail("", {}, [], true),
		]) {
			const urls = [...html.matchAll(/(?:src|href)="([^"]*hydrate[^"]*)"/g)].map((m) => m[1]);
			expect(urls.length).toBeGreaterThan(0);
			for (const url of urls) expect(url).toBe(entry);
		}
	});
});

describe("safeLang", () => {
	test("accepts BCP 47-ish tags", () => {
		expect(safeLang("en")).toBe("en");
		expect(safeLang("en-US")).toBe("en-US");
		expect(safeLang("zh-Hant")).toBe("zh-Hant");
	});

	test("rejects attribute-injection attempts", () => {
		expect(safeLang(`"><script>`)).toBe("en");
		expect(safeLang("en US")).toBe("en");
		expect(safeLang("")).toBe("en");
		expect(safeLang(undefined)).toBe("en");
	});

	test("rejects too-long tags", () => {
		expect(safeLang("a".repeat(36))).toBe("en");
	});
});

describe("route modulepreload links", () => {
	// Without these the page's chunks only start downloading after the entry has
	// run, and clicks before hydration hit dead buttons.
	const segments: AppHtmlSegments = {
		headOpen: `<!DOCTYPE html>\n<html lang="%bosia.lang%">\n<head>\n`,
		headClose: `\n</head>\n<body>\n`,
		tail: `\n</body>\n</html>`,
		hasCustomFavicon: false,
	};
	const link = (f: string) => `<link rel="modulepreload" href="/dist/client/${f}">`;
	const page = (csr: boolean, segs?: AppHtmlSegments, pattern?: string) =>
		buildHtml(
			"",
			"",
			{},
			[],
			csr,
			null,
			"en",
			true,
			undefined,
			null,
			null,
			undefined,
			segs,
			null,
			pattern,
		);

	test("every render path preloads the route's chunks, in <head>", () => {
		distManifest.preload = { "/blog/[slug]": ["chunk-layout.js", "chunk-page.js"] };
		try {
			for (const html of [
				buildHtmlShellOpen("en", undefined, undefined, "/blog/[slug]"),
				buildHtmlShellOpen("en", undefined, segments, "/blog/[slug]"),
				page(true, undefined, "/blog/[slug]"),
				page(true, segments, "/blog/[slug]"),
			]) {
				expect(html).toContain(link("chunk-layout.js"));
				expect(html).toContain(link("chunk-page.js"));
				expect(html).toContain(
					`<link rel="modulepreload" href="/dist/client/${distManifest.entry}">`,
				);
				const headEnd = html.indexOf("</head>");
				if (headEnd !== -1) expect(html.indexOf("chunk-page.js")).toBeLessThan(headEnd);
			}
		} finally {
			delete distManifest.preload;
		}
	});

	test("unknown pattern, no pattern, or an older dist/ adds no route links", () => {
		distManifest.preload = { "/blog/[slug]": ["chunk-page.js"] };
		try {
			expect(buildHtmlShellOpen("en", undefined, undefined, "/about")).not.toContain("chunk-");
			expect(buildHtmlShellOpen("en")).not.toContain("chunk-");
			expect(page(true, undefined, "/about")).not.toContain("chunk-");
		} finally {
			delete distManifest.preload;
		}
		expect(page(true, undefined, "/blog/[slug]")).not.toContain("chunk-");
	});

	test("csr=false pages preload nothing — no JS will run", () => {
		distManifest.preload = { "/blog/[slug]": ["chunk-page.js"] };
		try {
			const html = page(false, undefined, "/blog/[slug]");
			expect(html).not.toContain("modulepreload");
		} finally {
			delete distManifest.preload;
		}
	});
});

describe("buildHtml — template segments", () => {
	const segments: AppHtmlSegments = {
		headOpen: `<!DOCTYPE html>\n<html lang="%bosia.lang%">\n<head>\n`,
		headClose: `\n</head>\n<body>\n`,
		tail: `\n</body>\n</html>`,
		hasCustomFavicon: false,
	};

	test("buildHtml with segments uses template structure", () => {
		const html = buildHtml(
			"test body",
			"<title>Test</title>",
			{},
			[],
			false,
			null,
			"en",
			true,
			undefined,
			null,
			null,
			undefined,
			segments,
		);

		// Should contain interpolated version of headOpen with lang replaced
		expect(html).toContain('lang="en"');
		expect(html).toContain("test body");
		expect(html).toContain(segments.tail);
		expect(html).toContain("<title>Test</title>");
	});

	test("buildHtmlShellOpen replaces %bosia.lang% at call time", () => {
		const html = buildHtmlShellOpen("id", undefined, segments);
		expect(html).toContain("id");
		expect(html).not.toContain("%bosia.lang%");
	});

	test("buildHtmlShellOpen skips favicon when hasCustomFavicon=true", () => {
		const customSegments: AppHtmlSegments = {
			...segments,
			hasCustomFavicon: true,
		};

		const html = buildHtmlShellOpen("en", undefined, customSegments);
		expect(html).not.toContain('rel="icon"');
	});

	test("buildMetadataChunk uses segments headClose", () => {
		const html = buildMetadataChunk({ title: "Test" }, { segments });
		expect(html).toContain(segments.headClose);
		expect(html).toContain("Test");
	});

	test("plugin extras come before app.html's post-head markup, <svelte:head> after it", () => {
		const withTheme: AppHtmlSegments = {
			...segments,
			headClose: `\n  <link rel="stylesheet" href="/theme.css">\n</head>\n<body>`,
		};
		const extra = `<link rel="canonical" href="https://x.test/">`;
		const head = `<style>body{background:red}</style>`;
		const check = (html: string) => {
			const theme = html.indexOf("/theme.css");
			expect(html.indexOf(extra)).toBeGreaterThan(-1);
			expect(theme).toBeGreaterThan(html.indexOf(extra));
			expect(html.indexOf(head)).toBeGreaterThan(theme);
			expect(html.indexOf(head)).toBeLessThan(html.indexOf("</head>"));
		};
		check(buildMetadataChunk({ title: "T" }, { headExtras: [extra], segments: withTheme, head }));
		check(
			buildHtml(
				"",
				head,
				{},
				[],
				true,
				null,
				"en",
				true,
				undefined,
				null,
				null,
				undefined,
				withTheme,
				{ title: "T" },
				undefined,
				[extra],
			),
		);
	});

	test("an app.html <title> suppresses the fallback on both paths", () => {
		const titled: AppHtmlSegments = {
			...segments,
			headClose: `\n  <title>My Shop</title>\n</head>\n<body>`,
		};
		expect(buildMetadataChunk({ description: "d" }, { segments: titled })).not.toContain(
			"Bosia App",
		);
		const html = buildHtml(
			"",
			"",
			{},
			[],
			true,
			null,
			"en",
			true,
			undefined,
			null,
			null,
			undefined,
			titled,
			{
				description: "d",
			},
		);
		expect(html).not.toContain("Bosia App");
		// A <title> placed after </head> is not a head title.
		const bodyTitle: AppHtmlSegments = {
			...segments,
			headClose: `\n</head>\n<body><title>x</title>`,
		};
		expect(buildMetadataChunk({ description: "d" }, { segments: bodyTitle })).toContain(
			"Bosia App",
		);
	});

	test("an app.html title without </head> still suppresses the fallback", () => {
		const noHeadEnd: AppHtmlSegments = {
			...segments,
			headClose: `\n  <title>Shop</title>\n<body>`,
		};
		const html = buildMetadataChunk(
			{ description: "d" },
			{ segments: noHeadEnd, head: "<style>x</style>" },
		);
		expect(html).not.toContain("Bosia App");
		expect(html.indexOf("<style>x</style>")).toBeGreaterThan(html.indexOf("<title>Shop</title>"));
	});

	test("a </head> inside an app.html comment is not taken as the close tag", () => {
		const commented: AppHtmlSegments = {
			...segments,
			headClose: `\n  <!-- keep before </head> -->\n</head>\n<body>`,
		};
		const head = `<meta name="from-head" content="1">`;
		for (const html of [
			buildMetadataChunk({ title: "T" }, { segments: commented, head }),
			buildHtml(
				"",
				head,
				{},
				[],
				true,
				null,
				"en",
				true,
				undefined,
				null,
				null,
				undefined,
				commented,
				{
					title: "T",
				},
			),
		]) {
			expect(html).toContain("<!-- keep before </head> -->");
			expect(html.indexOf(head)).toBeGreaterThan(html.indexOf("-->"));
		}
	});

	test("buildMetadataChunk fills %bosia.nonce% in headClose, like buildHtml", () => {
		const nonced: AppHtmlSegments = {
			...segments,
			headClose: `<script nonce="%bosia.nonce%">x()</script>\n</head>\n<body>`,
		};
		const html = buildMetadataChunk({ title: "T" }, { segments: nonced, nonce: "abc123" });
		expect(html).toContain('nonce="abc123"');
		expect(html).not.toContain("%bosia.nonce%");
	});

	test("buildHtmlTail uses segments tail", () => {
		const html = buildHtmlTail(
			"<div>content</div>",
			{},
			[],
			false,
			null,
			true,
			undefined,
			undefined,
			null,
			null,
			segments,
		);

		expect(html).toContain(segments.tail);
		expect(html).toContain("content");
	});
});

describe("public runtime env", () => {
	test("exposes only PUBLIC_* names the build declared, with live values", () => {
		process.env.PUBLIC_DECLARED_X = "yes";
		process.env.PUBLIC_UNDECLARED_X = "leak";
		distManifest.publicEnv = ["PUBLIC_DECLARED_X", "PUBLIC_UNSET_X"];
		try {
			expect(getPublicDynamicEnv()).toEqual({ PUBLIC_DECLARED_X: "yes" });
			expect(buildHtml("", "", {}, [], true, null, "en", true)).toContain(
				`window.__BOSIA_ENV__={"PUBLIC_DECLARED_X":"yes"}`,
			);
		} finally {
			delete distManifest.publicEnv;
			delete process.env.PUBLIC_DECLARED_X;
			delete process.env.PUBLIC_UNDECLARED_X;
		}
	});

	test("no declared names → no env script", () => {
		expect(getPublicDynamicEnv()).toEqual({});
		expect(buildHtml("", "", {}, [], true, null, "en", true)).not.toContain("__BOSIA_ENV__");
	});
});
