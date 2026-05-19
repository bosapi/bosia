import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { writeFileSync, unlinkSync, mkdirSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import {
	loadAppHtmlTemplate,
	getAppHtmlSegments,
	invalidateAppHtmlCache,
	interpolateSegment,
} from "../src/core/appHtml.ts";

const testDir = join(tmpdir(), `bosia-test-${Date.now()}`);

function setup() {
	mkdirSync(testDir, { recursive: true });
	mkdirSync(join(testDir, "src"), { recursive: true });
}

function teardown() {
	try {
		rmSync(testDir, { recursive: true, force: true });
	} catch {}
}

describe("appHtml", () => {
	beforeEach(setup);
	afterEach(teardown);

	it("throws when src/app.html absent", () => {
		expect(() => {
			loadAppHtmlTemplate(testDir);
		}).toThrow(/required but not found/);
	});

	it("correct segment split from minimal valid template", () => {
		const template = `<!DOCTYPE html>
<html>
<head>
  %bosia.head%
</head>
<body>
  %bosia.body%
</body>
</html>`;
		writeFileSync(join(testDir, "src", "app.html"), template);

		const result = loadAppHtmlTemplate(testDir);
		expect(result).not.toBeNull();
		expect(result!.headOpen).toBe(`<!DOCTYPE html>\n<html>\n<head>\n  `);
		expect(result!.headClose).toBe(`\n</head>\n<body>\n  `);
		expect(result!.tail).toBe(`\n</body>\n</html>`);
		expect(result!.hasCustomFavicon).toBe(false);
	});

	it("%bosia.env.PUBLIC_FOO% inlined at parse time", () => {
		process.env.PUBLIC_TEST = "test-value";
		const template = `<!DOCTYPE html>
<html>
<head>
  <meta name="test" content="%bosia.env.PUBLIC_TEST%">
  %bosia.head%
</head>
<body>
  %bosia.body%
</body>
</html>`;
		writeFileSync(join(testDir, "src", "app.html"), template);

		const result = loadAppHtmlTemplate(testDir);
		expect(result).not.toBeNull();
		expect(result!.headOpen).toContain("test-value");
		delete process.env.PUBLIC_TEST;
	});

	it("%bosia.lang% preserved in headOpen after parse", () => {
		const template = `<!DOCTYPE html>
<html lang="%bosia.lang%">
<head>
  %bosia.head%
</head>
<body>
  %bosia.body%
</body>
</html>`;
		writeFileSync(join(testDir, "src", "app.html"), template);

		const result = loadAppHtmlTemplate(testDir);
		expect(result).not.toBeNull();
		expect(result!.headOpen).toContain("%bosia.lang%");
	});

	it("missing %bosia.head% throws with clear message", () => {
		const template = `<!DOCTYPE html>
<html>
<head>
</head>
<body>
  %bosia.body%
</body>
</html>`;
		writeFileSync(join(testDir, "src", "app.html"), template);

		expect(() => {
			loadAppHtmlTemplate(testDir);
		}).toThrow(/missing required placeholder.*%bosia\.head%/);
	});

	it("missing %bosia.body% throws with clear message", () => {
		const template = `<!DOCTYPE html>
<html>
<head>
  %bosia.head%
</head>
<body>
</body>
</html>`;
		writeFileSync(join(testDir, "src", "app.html"), template);

		expect(() => {
			loadAppHtmlTemplate(testDir);
		}).toThrow(/missing required placeholder.*%bosia\.body%/);
	});

	it("getAppHtmlSegments returns cached object on second call", () => {
		const template = `<!DOCTYPE html>
<html>
<head>
  %bosia.head%
</head>
<body>
  %bosia.body%
</body>
</html>`;
		writeFileSync(join(testDir, "src", "app.html"), template);

		invalidateAppHtmlCache();
		const first = getAppHtmlSegments(testDir);
		const second = getAppHtmlSegments(testDir);
		expect(first).toBe(second);
	});

	it("invalidateAppHtmlCache causes re-read", () => {
		let template = `<!DOCTYPE html>
<html>
<head>
  %bosia.head%
</head>
<body>
  %bosia.body%
</body>
</html>`;
		writeFileSync(join(testDir, "src", "app.html"), template);

		invalidateAppHtmlCache();
		const first = getAppHtmlSegments(testDir);
		expect(first).not.toBeNull();

		// Update the file
		template = `<!DOCTYPE html>
<html data-updated="true">
<head>
  %bosia.head%
</head>
<body>
  %bosia.body%
</body>
</html>`;
		writeFileSync(join(testDir, "src", "app.html"), template);

		invalidateAppHtmlCache();
		const second = getAppHtmlSegments(testDir);
		expect(second!.headOpen).not.toBe(first!.headOpen);
		expect(second!.headOpen).toContain("data-updated");
	});

	it('hasCustomFavicon flag set when headOpen contains rel="icon"', () => {
		const template = `<!DOCTYPE html>
<html>
<head>
  <link rel="icon" href="/favicon.ico">
  %bosia.head%
</head>
<body>
  %bosia.body%
</body>
</html>`;
		writeFileSync(join(testDir, "src", "app.html"), template);

		const result = loadAppHtmlTemplate(testDir);
		expect(result).not.toBeNull();
		expect(result!.hasCustomFavicon).toBe(true);
	});

	it("interpolateSegment replaces %bosia.lang%", () => {
		const segment = '<html lang="%bosia.lang%">';
		const result = interpolateSegment(segment, { lang: "id" });
		expect(result).toBe('<html lang="id">');
	});

	it("interpolateSegment replaces %bosia.nonce%", () => {
		const segment = "<script %bosia.nonce%>var x=1;</script>";
		const result = interpolateSegment(segment, { nonce: 'nonce="abc123"' });
		expect(result).toBe('<script nonce="abc123">var x=1;</script>');
	});

	it("interpolateSegment replaces both lang and nonce", () => {
		const segment = '<html lang="%bosia.lang%"><script %bosia.nonce%></script>';
		const result = interpolateSegment(segment, { lang: "fr", nonce: 'nonce="xyz"' });
		expect(result).toBe('<html lang="fr"><script nonce="xyz"></script>');
	});
});
