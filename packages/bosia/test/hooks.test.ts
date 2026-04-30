import { describe, expect, test } from "bun:test";
import { sequence, type Handle, type RequestEvent } from "../src/core/hooks.ts";

function makeEvent(): RequestEvent {
	return {
		request: new Request("http://localhost/"),
		url: new URL("http://localhost/"),
		locals: {},
		params: {},
		cookies: {
			get: () => undefined,
			getAll: () => ({}),
			set: () => {},
			delete: () => {},
		},
	};
}

describe("sequence()", () => {
	test("returns identity-like handler when called with no args", async () => {
		const h = sequence();
		const event = makeEvent();
		const res = new Response("ok");
		const out = await h({ event, resolve: async () => res });
		expect(out).toBe(res);
	});

	test("invokes single handler with original resolve", async () => {
		const calls: string[] = [];
		const a: Handle = async ({ event, resolve }) => {
			calls.push("a-before");
			const r = await resolve(event);
			calls.push("a-after");
			return r;
		};
		const h = sequence(a);
		await h({ event: makeEvent(), resolve: async () => new Response("x") });
		expect(calls).toEqual(["a-before", "a-after"]);
	});

	test("composes handlers left-to-right (a wraps b wraps resolve)", async () => {
		const order: string[] = [];
		const a: Handle = async ({ event, resolve }) => {
			order.push("a-in");
			const r = await resolve(event);
			order.push("a-out");
			return r;
		};
		const b: Handle = async ({ event, resolve }) => {
			order.push("b-in");
			const r = await resolve(event);
			order.push("b-out");
			return r;
		};
		const h = sequence(a, b);
		await h({
			event: makeEvent(),
			resolve: async () => {
				order.push("resolve");
				return new Response("ok");
			},
		});
		expect(order).toEqual(["a-in", "b-in", "resolve", "b-out", "a-out"]);
	});

	test("handler can short-circuit and skip downstream", async () => {
		const order: string[] = [];
		const gate: Handle = async () => {
			order.push("gate");
			return new Response("blocked", { status: 403 });
		};
		const downstream: Handle = async ({ event, resolve }) => {
			order.push("downstream");
			return resolve(event);
		};
		const h = sequence(gate, downstream);
		const res = await h({
			event: makeEvent(),
			resolve: async () => {
				order.push("final");
				return new Response("ok");
			},
		});
		expect(res.status).toBe(403);
		expect(order).toEqual(["gate"]);
	});

	test("handlers can mutate event.locals visible to downstream", async () => {
		const auth: Handle = async ({ event, resolve }) => {
			event.locals.user = { id: 1 };
			return resolve(event);
		};
		let seen: any;
		const h = sequence(auth);
		await h({
			event: makeEvent(),
			resolve: async (e) => {
				seen = e.locals.user;
				return new Response("");
			},
		});
		expect(seen).toEqual({ id: 1 });
	});
});
