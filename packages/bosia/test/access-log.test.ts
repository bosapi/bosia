import { describe, expect, test } from "bun:test";
import { BosiaApp } from "../src/core/backend.ts";
import { accessLog, type AccessLogOptions } from "../src/core/plugins/access-log.ts";

async function appWith(options: AccessLogOptions) {
	const plugin = accessLog(options);
	let app = new BosiaApp();
	app = (await plugin.backend!.before!(app)) ?? app;
	return app;
}

describe("accessLog plugin", () => {
	test("declares plugin name", () => {
		expect(accessLog({ write: () => {} }).name).toBe("access-log");
	});

	test("logs method, path without query, status and duration", async () => {
		const out: string[] = [];
		const app = (await appWith({ write: (c) => out.push(c), flushMs: 0 }))
			.get("/blog", () => "ok")
			.get("/missing", ({ set }) => {
				set.status = 404;
				return "nope";
			});
		await app.fetch(new Request("http://localhost/blog?x=1"));
		await app.fetch(new Request("http://localhost/missing"));
		expect(out[0]).toMatch(/^\[GET\] \/blog 200 \(\d+\.\dms\)\n$/);
		expect(out[1]).toMatch(/^\[GET\] \/missing 404 /);
	});

	test("a request that throws is logged as 500", async () => {
		const out: string[] = [];
		const app = (await appWith({ write: (c) => out.push(c), flushMs: 0 })).get("/boom", () => {
			throw new Error("boom");
		});
		const res = await app.fetch(new Request("http://localhost/boom"));
		expect(res.status).toBe(500);
		expect(out.join("")).toMatch(/^\[GET\] \/boom 500 /);
	});

	test("batches lines until the buffer passes 64KB, then writes them together", async () => {
		const out: string[] = [];
		const app = (
			await appWith({
				write: (c) => out.push(c),
				flushMs: 60_000,
				// 20KB a line: the fourth line takes the buffer past 64KB.
				format: (e) => e.path + "x".repeat(20_000),
			})
		).get("/", () => "ok");
		for (let i = 0; i < 3; i++) await app.fetch(new Request("http://localhost/"));
		expect(out.length).toBe(0);
		await app.fetch(new Request("http://localhost/"));
		expect(out.length).toBe(1);
		expect(out[0]!.split("\n").filter(Boolean).length).toBe(4);
	});

	test("an async sink that rejects is contained", async () => {
		const unhandled: unknown[] = [];
		const onUnhandled = (e: unknown) => unhandled.push(e);
		process.on("unhandledRejection", onUnhandled);
		try {
			const app = (
				await appWith({ write: () => Promise.reject(new Error("shipper down")), flushMs: 0 })
			).get("/", () => "ok");
			const res = await app.fetch(new Request("http://localhost/"));
			expect(await res.text()).toBe("ok");
			await Bun.sleep(10);
			expect(unhandled).toEqual([]);
		} finally {
			process.off("unhandledRejection", onUnhandled);
		}
	});

	test("an async onResponse observer that rejects is contained", async () => {
		const unhandled: unknown[] = [];
		const onUnhandled = (e: unknown) => unhandled.push(e);
		process.on("unhandledRejection", onUnhandled);
		try {
			const app = new BosiaApp()
				.onResponse(async () => {
					throw new Error("metrics down");
				})
				.get("/", () => "ok");
			const res = await app.fetch(new Request("http://localhost/"));
			expect(await res.text()).toBe("ok");
			await Bun.sleep(10);
			expect(unhandled).toEqual([]);
		} finally {
			process.off("unhandledRejection", onUnhandled);
		}
	});

	test("fetchUnobserved answers without running observers", async () => {
		const out: string[] = [];
		const app = (await appWith({ write: (c) => out.push(c), flushMs: 0 })).get("/", () => "ok");
		const res = await app.fetchUnobserved(new Request("http://localhost/"));
		expect(await res.text()).toBe("ok");
		expect(out).toEqual([]);
	});

	test("filter and format are honored", async () => {
		const out: string[] = [];
		const app = (
			await appWith({
				write: (c) => out.push(c),
				flushMs: 0,
				filter: (e) => e.status >= 400,
				format: (e) => `${e.status} ${e.path}`,
			})
		)
			.get("/ok", () => "ok")
			.get("/bad", ({ set }) => {
				set.status = 400;
				return "bad";
			});
		await app.fetch(new Request("http://localhost/ok"));
		await app.fetch(new Request("http://localhost/bad"));
		expect(out).toEqual(["400 /bad\n"]);
	});

	test("logs the final status once, even when a later hook replaces the response", async () => {
		const out: string[] = [];
		let app = await appWith({ write: (c) => out.push(c), flushMs: 0 });
		app = app.onAfterHandle(() => new Response("gone", { status: 410 })).get("/x", () => "ok");
		const res = await app.fetch(new Request("http://localhost/x"));
		expect(res.status).toBe(410);
		expect(out).toHaveLength(1);
		expect(out[0]).toMatch(/^\[GET\] \/x 410 /);
	});

	test("a request an earlier onRequest answers is still logged", async () => {
		const out: string[] = [];
		const plugin = accessLog({ write: (c) => out.push(c), flushMs: 0 });
		let app = new BosiaApp().onRequest(() => new Response("slow down", { status: 429 }));
		app = (await plugin.backend!.before!(app)) ?? app;
		await app.fetch(new Request("http://localhost/"));
		expect(out[0]).toMatch(/^\[GET\] \/ 429 /);
	});

	test("a request whose error hook throws is still logged as 500", async () => {
		const out: string[] = [];
		let app = await appWith({ write: (c) => out.push(c), flushMs: 0 });
		app = app
			.onError(() => {
				throw new Error("reporter down");
			})
			.get("/x", () => {
				throw new Error("boom");
			});
		await expect(app.fetch(new Request("http://localhost/x"))).rejects.toThrow("reporter down");
		expect(out[0]).toMatch(/^\[GET\] \/x 500 /);
	});

	test("a throwing format doesn't break the response", async () => {
		const app = (
			await appWith({
				format: () => {
					throw new Error("bad format");
				},
				flushMs: 0,
			})
		).get("/", () => "ok");
		const res = await app.fetch(new Request("http://localhost/"));
		expect(await res.text()).toBe("ok");
	});

	test("a throwing sink doesn't break the response", async () => {
		const app = (
			await appWith({
				write: () => {
					throw new Error("disk full");
				},
				flushMs: 0,
			})
		).get("/", () => "ok");
		const res = await app.fetch(new Request("http://localhost/"));
		expect(await res.text()).toBe("ok");
	});
});
