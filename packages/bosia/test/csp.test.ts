import { describe, expect, test } from "bun:test";
import { generateNonce, nonceAttr, buildCspHeader } from "../src/core/csp.ts";
import { buildHtml, buildHtmlShellOpen, buildHtmlTail } from "../src/core/html.ts";

describe("generateNonce", () => {
	test("returns a base64 string with at least 22 chars (16 bytes → 128 bits)", () => {
		const nonce = generateNonce();
		expect(nonce.length).toBeGreaterThanOrEqual(22);
		// base64 alphabet (no padding)
		expect(nonce).toMatch(/^[A-Za-z0-9+/]+$/);
	});

	test("two consecutive calls return different values", () => {
		const a = generateNonce();
		const b = generateNonce();
		expect(a).not.toBe(b);
	});

	test("100 consecutive calls are all unique (collision-resistance smoke check)", () => {
		const seen = new Set<string>();
		for (let i = 0; i < 100; i++) seen.add(generateNonce());
		expect(seen.size).toBe(100);
	});
});

describe("nonceAttr", () => {
	test("returns ' nonce=\"…\"' when nonce is provided", () => {
		expect(nonceAttr("abc")).toBe(' nonce="abc"');
	});

	test("returns empty string when nonce is undefined or empty", () => {
		expect(nonceAttr(undefined)).toBe("");
		expect(nonceAttr("")).toBe("");
	});
});

describe("buildHtml — nonce embedding", () => {
	test("every framework <script> tag carries the nonce when provided", () => {
		const html = buildHtml(
			"<p>hi</p>",
			"",
			{ greeting: "hello" },
			[{ layout: 1 }],
			true,
			null,
			"en",
			true,
			"NONCE_X",
		);
		// Theme bootstrap inline + page-data + module hydration script — all three
		const matches = html.match(/<script\s+nonce="NONCE_X"/g) ?? [];
		expect(matches.length).toBeGreaterThanOrEqual(3);
		// No bare <script> tags slipped through
		expect(html).not.toMatch(/<script(?!\s+nonce=)/);
	});

	test("no nonce attribute is emitted when none is provided", () => {
		const html = buildHtml("", "", {}, [], true, null, "en", true);
		expect(html).not.toContain("nonce=");
	});
});

describe("buildHtmlShellOpen — nonce on theme bootstrap script", () => {
	test("theme script carries nonce when provided", () => {
		const shell = buildHtmlShellOpen("en", "SHELL_NONCE");
		expect(shell).toContain('<script nonce="SHELL_NONCE">try{var t=localStorage');
	});

	test("no nonce attribute when not provided", () => {
		const shell = buildHtmlShellOpen("en");
		expect(shell).not.toContain("nonce=");
	});
});

describe("buildHtmlTail — nonce on every emitted <script>", () => {
	test("hydration + spinner-remove + data scripts all carry the nonce", () => {
		const tail = buildHtmlTail(
			"<p>hi</p>",
			"<meta name='x'>",
			{ a: 1 },
			[{ b: 2 }],
			true,
			{ formField: "v" },
			true,
			undefined,
			"TAIL_NONCE",
		);
		// Spinner-remove + head-insert + page-data + module hydration → 4 framework scripts
		const matches = tail.match(/<script\s+nonce="TAIL_NONCE"/g) ?? [];
		expect(matches.length).toBeGreaterThanOrEqual(4);
		// No bare framework <script> tags
		expect(tail).not.toMatch(/<script(?!\s+nonce=)/);
	});

	test("bodyEnd plugin fragments are NOT rewritten — they are user-controlled", () => {
		const tail = buildHtmlTail(
			"",
			"",
			{},
			[],
			true,
			null,
			true,
			[`<script>window.PLUGIN=1</script>`],
			"TAIL_NONCE",
		);
		// Plugin fragment passes through verbatim; only framework scripts get the nonce
		expect(tail).toContain(`<script>window.PLUGIN=1</script>`);
	});
});

describe("buildCspHeader — opt-in CSP env", () => {
	test("returns null when CSP_DIRECTIVES is unset (default behavior)", () => {
		// CSP_DIRECTIVES_TEMPLATE is captured at module load; we cannot mutate it
		// here. This test asserts the public contract for the unset case using a
		// fresh nonce — when the env was unset at boot, buildCspHeader returns
		// null regardless of nonce value.
		// (In the bun test runner CSP_DIRECTIVES is not set.)
		expect(buildCspHeader("any")).toBeNull();
	});
});
