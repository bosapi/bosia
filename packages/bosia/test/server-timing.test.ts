import { describe, expect, test } from "bun:test";
import { BosiaApp } from "../src/core/backend.ts";
import { serverTiming } from "../src/core/plugins/server-timing.ts";

describe("serverTiming plugin", () => {
	test("declares plugin name", () => {
		const p = serverTiming();
		expect(p.name).toBe("server-timing");
	});

	test("adds Server-Timing header to responses", async () => {
		const plugin = serverTiming();
		let app = new BosiaApp();
		app = (await plugin.backend!.before!(app)) ?? app;
		app = app.get("/", () => "ok");

		const res = await app.fetch(new Request("http://localhost/"));
		const header = res.headers.get("Server-Timing");
		expect(header).not.toBeNull();
		expect(header).toMatch(/^handler;dur=\d+/);
	});

	test("custom metric name is honored", async () => {
		const plugin = serverTiming({ metric: "bosia" });
		let app = new BosiaApp();
		app = (await plugin.backend!.before!(app)) ?? app;
		app = app.get("/", () => "ok");

		const res = await app.fetch(new Request("http://localhost/"));
		const header = res.headers.get("Server-Timing");
		expect(header).toMatch(/^bosia;dur=/);
	});
});
