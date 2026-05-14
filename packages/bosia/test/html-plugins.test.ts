import { describe, expect, test } from "bun:test";
import { buildMetadataChunk, buildHtmlTail } from "../src/core/html.ts";

describe("buildMetadataChunk — plugin head fragments", () => {
	test("injects head extras before </head>, after metadata", () => {
		const out = buildMetadataChunk({ title: "X" }, [
			`<meta name="generator" content="alpha">`,
			`<meta name="generator" content="beta">`,
		]);
		expect(out).toContain("<title>X</title>");
		const headClose = out.indexOf("</head>");
		const alpha = out.indexOf("alpha");
		const beta = out.indexOf("beta");
		expect(alpha).toBeGreaterThan(0);
		expect(alpha).toBeLessThan(headClose);
		expect(beta).toBeLessThan(headClose);
		expect(alpha).toBeLessThan(beta); // registration order preserved
	});

	test("no head extras → output unchanged from base behavior", () => {
		const a = buildMetadataChunk({ title: "X" });
		const b = buildMetadataChunk({ title: "X" }, []);
		expect(a).toBe(b);
	});
});

describe("buildHtmlTail — plugin bodyEnd fragments", () => {
	test("injects bodyEnd extras before </body>, after hydration script", () => {
		const out = buildHtmlTail("<p>hi</p>", "", {}, [], true, null, true, [
			`<script>window.A=1</script>`,
			`<script>window.B=2</script>`,
		]);
		const bodyClose = out.indexOf("</body>");
		const a = out.indexOf("window.A=1");
		const b = out.indexOf("window.B=2");
		expect(a).toBeGreaterThan(0);
		expect(a).toBeLessThan(bodyClose);
		expect(b).toBeLessThan(bodyClose);
		expect(a).toBeLessThan(b);
	});

	test("hydration script still appears before bodyEnd extras when csr=true", () => {
		const out = buildHtmlTail("", "", {}, [], true, null, true, [`<!--plugin-->`]);
		const hydrate = out.indexOf("__bosia-page-data__");
		const plugin = out.indexOf("<!--plugin-->");
		expect(hydrate).toBeGreaterThan(0);
		expect(hydrate).toBeLessThan(plugin);
	});
});
