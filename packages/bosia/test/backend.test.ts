import { describe, expect, test } from "bun:test";
import { BosiaApp } from "../src/core/backend.ts";

const req = (path: string, init?: RequestInit) => new Request(`http://localhost${path}`, init);

describe("BosiaApp", () => {
	test("normalizes handler return values", async () => {
		const app = new BosiaApp()
			.get("/text", () => "hi")
			.get("/json", () => ({ ok: true }))
			.get("/empty", () => undefined)
			.get("/raw", () => new Response("raw", { status: 201 }));

		const text = await app.fetch(req("/text"));
		expect(text.headers.get("content-type")).toContain("text/plain");
		expect(await text.text()).toBe("hi");

		expect(await (await app.fetch(req("/json"))).json()).toEqual({ ok: true });

		const empty = await app.fetch(req("/empty"));
		expect(empty.status).toBe(200);
		expect(await empty.text()).toBe("");

		const raw = await app.fetch(req("/raw"));
		expect(raw.status).toBe(201);
		expect(await raw.text()).toBe("raw");
	});

	test("handlers get the parsed url and the query", async () => {
		let seen: { path: string; query: Record<string, string> } | null = null;
		const app = new BosiaApp().get("/q", ({ url, query }) => {
			seen = { path: url.pathname, query };
			return "ok";
		});
		await app.fetch(req("/q?a=1&b=2"));
		expect(seen!).toEqual({ path: "/q", query: { a: "1", b: "2" } });
	});

	test("merges set.status and set.headers", async () => {
		const app = new BosiaApp().get("/", ({ set }) => {
			set.status = 418;
			set.headers["x-a"] = "1";
			return "teapot";
		});
		const res = await app.fetch(req("/"));
		expect(res.status).toBe(418);
		expect(res.headers.get("x-a")).toBe("1");
	});

	test("exact path beats * regardless of order", async () => {
		const app = new BosiaApp().get("*", () => "catch-all").get("/exact", () => "exact");
		expect(await (await app.fetch(req("/exact"))).text()).toBe("exact");
		expect(await (await app.fetch(req("/other"))).text()).toBe("catch-all");
	});

	test("onRequest can short-circuit", async () => {
		const app = new BosiaApp()
			.onRequest(({ request }) =>
				new URL(request.url).pathname === "/blocked"
					? new Response("no", { status: 403 })
					: undefined,
			)
			.get("*", () => "ok");
		expect((await app.fetch(req("/blocked"))).status).toBe(403);
		expect((await app.fetch(req("/fine"))).status).toBe(200);
	});

	test("onAfterHandle can replace the response", async () => {
		const app = new BosiaApp().onAfterHandle(() => "replaced").get("/", () => "original");
		expect(await (await app.fetch(req("/"))).text()).toBe("replaced");
	});

	test("onError runs in order; undefined falls through", async () => {
		const seen: string[] = [];
		const app = new BosiaApp()
			.onError(() => {
				seen.push("first");
				return undefined;
			})
			.onError(() => {
				seen.push("second");
				return Response.json({ error: "boom" }, { status: 500 });
			})
			.get("/", () => {
				throw new Error("boom");
			});
		const res = await app.fetch(req("/"));
		expect(res.status).toBe(500);
		expect(await res.json()).toEqual({ error: "boom" });
		expect(seen).toEqual(["first", "second"]);
	});

	test("unhandled error without onError answers 500", async () => {
		const app = new BosiaApp().get("/", () => {
			throw new Error("boom");
		});
		expect((await app.fetch(req("/"))).status).toBe(500);
	});

	test("HEAD runs GET and strips the body", async () => {
		const app = new BosiaApp().get("/", () => new Response("body", { headers: { "x-h": "1" } }));
		const res = await app.fetch(req("/", { method: "HEAD" }));
		expect(res.status).toBe(200);
		expect(res.headers.get("x-h")).toBe("1");
		expect(await res.text()).toBe("");
	});

	test("unrouted method answers 405 with Allow", async () => {
		const app = new BosiaApp().get("*", () => "ok").post("*", () => "ok");
		const res = await app.fetch(req("/", { method: "TRACE" }));
		expect(res.status).toBe(405);
		expect(res.headers.get("allow")).toBe("GET, POST, HEAD");
	});

	test("parses JSON and form bodies for exact routes", async () => {
		const app = new BosiaApp().post("/echo", ({ body }) => ({ body }));
		const json = await app.fetch(
			req("/echo", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ a: 1 }),
			}),
		);
		expect(await json.json()).toEqual({ body: { a: 1 } });

		const form = await app.fetch(
			req("/echo", { method: "POST", body: new URLSearchParams({ b: "2" }) }),
		);
		expect(await form.json()).toEqual({ body: { b: "2" } });
	});

	test("catch-all route leaves the body unread", async () => {
		const app = new BosiaApp().post("*", async ({ body, request }) => ({
			body: body ?? null,
			raw: await request.text(),
		}));
		const res = await app.fetch(req("/x", { method: "POST", body: "hello" }));
		expect(await res.json()).toEqual({ body: null, raw: "hello" });
	});
});

test("options() registers a route, not the constructor config", async () => {
	const app = new BosiaApp({ serve: { idleTimeout: 5 } }).options("*", () => "preflight");
	expect(await (await app.fetch(req("/", { method: "OPTIONS" }))).text()).toBe("preflight");
});
