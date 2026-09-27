import { describe, test, expect } from "bun:test";

import { FRAME_RE, parseTopFrame } from "../src/core/plugins/inspector/sourcemap.ts";
import { getOverlayScript } from "../src/core/plugins/inspector/overlay.ts";

// The inspector's error badge and "Send to AI" point at the stack's top frame.
// A `)` inside a route group like `(public)` used to end the file early, so the
// frame was skipped and the badge pointed at the next one — bosia's renderer.

describe("parseTopFrame", () => {
	test("keeps route groups in the path instead of skipping to the next frame", () => {
		const stack =
			"Error: boom\n" +
			"    at load (/app/src/routes/(public)/blog/+page.server.ts:5:11)\n" +
			"    at render (/app/node_modules/bosia/src/core/renderer.ts:800:3)";
		expect(parseTopFrame(stack)).toEqual({
			file: "/app/src/routes/(public)/blog/+page.server.ts",
			line: 5,
			col: 11,
		});
	});

	test("bare `at file:L:C` frame", () => {
		expect(parseTopFrame("Error: x\n    at /app/src/x.ts:1:2")).toEqual({
			file: "/app/src/x.ts",
			line: 1,
			col: 2,
		});
	});

	test("Firefox `@url:L:C` keeps the port in the file", () => {
		expect(parseTopFrame("fn@http://localhost:9000/_bosia/a.js:3:4")).toEqual({
			file: "http://localhost:9000/_bosia/a.js",
			line: 3,
			col: 4,
		});
	});

	test("Windows drive paths", () => {
		expect(parseTopFrame("Error: x\n    at f (C:\\app\\src\\routes\\(app)\\x.ts:7:8)")).toEqual({
			file: "C:\\app\\src\\routes\\(app)\\x.ts",
			line: 7,
			col: 8,
		});
	});

	test("null when there is no frame", () => {
		expect(parseTopFrame(undefined)).toBeNull();
		expect(parseTopFrame("Error: no frames here")).toBeNull();
	});
});

test("the browser overlay uses the same frame regex", () => {
	expect(getOverlayScript({ endpoint: "/x" })).toContain(JSON.stringify(FRAME_RE.source));
});
