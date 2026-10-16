import { afterAll, beforeEach, describe, expect, mock, test } from "bun:test";

// The real router/appState use Svelte runes, so stand in plain objects. `navigate`
// reports `next` (default: "same" on the current route, else "started").
let next: string | null = null;
let navigated = "";
const router = {
	currentRoute: "/a",
	suppressScroll: false,
	loading: false,
	navigate(path: string) {
		navigated = path;
		const result = next ?? (path === router.currentRoute ? "same" : "started");
		if (result === "started") router.currentRoute = path;
		return result;
	},
};
const appState = {
	invalidationTick: 0,
	dirty: { all: false },
	navResolvers: [] as (() => void)[],
};
mock.module("../src/core/client/router.svelte.ts", () => ({ router }));
mock.module("../src/core/client/appState.svelte.ts", () => ({ appState }));
// Only this file needs a browser `window`; later files must still see the server.
const hadWindow = "window" in globalThis;
if (!hadWindow) (globalThis as any).window = {};
const win = (globalThis as any).window;
const hadLocation = "location" in win;
const location = win.location;
win.location = { href: "http://x.test/a?q=1", origin: "http://x.test" };
afterAll(() => {
	if (hadLocation) win.location = location;
	else delete win.location;
	if (!hadWindow) delete (globalThis as any).window;
});

const { goto, go, drainNavResolvers } = await import("../src/core/client/navigation.ts");

beforeEach(() => {
	next = null;
	router.currentRoute = "/a";
	router.suppressScroll = false;
	router.loading = false;
	appState.invalidationTick = 0;
	appState.dirty.all = false;
	appState.navResolvers = [];
});

describe("goto", () => {
	test("same URL + invalidateAll bumps the tick and waits for the re-run", () => {
		goto("/a", { invalidateAll: true });
		expect(appState.dirty.all).toBe(true);
		expect(appState.invalidationTick).toBe(1);
		expect(appState.navResolvers.length).toBe(1);
	});

	test("same URL without invalidateAll resolves now", () => {
		goto("/a");
		expect(appState.invalidationTick).toBe(0);
		expect(appState.navResolvers.length).toBe(0);
	});

	test("noScroll sticks only to a nav that starts", () => {
		goto("/a", { noScroll: true });
		expect(router.suppressScroll).toBe(false);
		goto("/b", { noScroll: true });
		expect(router.suppressScroll).toBe(true);
	});

	for (const result of ["cancelled", "left"]) {
		test(`${result} nav marks nothing and resolves now`, () => {
			next = result;
			goto("/b", { invalidateAll: true, noScroll: true });
			expect(appState.dirty.all).toBe(false);
			expect(appState.invalidationTick).toBe(0);
			expect(router.suppressScroll).toBe(false);
			expect(appState.navResolvers.length).toBe(0);
		});
	}
});

describe("goto resolves relative URLs against the current page", () => {
	const cases: [string, string][] = [
		["?page=2", "/a?page=2"],
		["b", "/b"],
		["#x", "/a?q=1#x"],
		["http://x.test/c", "/c"],
		["https://other.test/c", "https://other.test/c"],
		["/d", "/d"],
	];
	for (const [url, path] of cases) {
		test(`${url} → ${path}`, () => {
			goto(url);
			expect(navigated).toBe(path);
		});
	}
});

describe("goto while a nav is loading", () => {
	test("a cancelled call resolves itself, not the nav still loading", async () => {
		let loadingDone = false;
		goto("/b").then(() => (loadingDone = true));
		next = "cancelled";
		await go("/c", {}, false);
		await Promise.resolve();
		expect(loadingDone).toBe(false);
		expect(appState.navResolvers.length).toBe(1);
	});

	test("a call to the loading URL waits for it, even one a link started", () => {
		router.currentRoute = "/b";
		router.loading = true; // a link click's run: nothing queued
		goto("/b");
		expect(appState.navResolvers.length).toBe(1);
	});
});

describe("drainNavResolvers", () => {
	test("takes the waiters now, releases them after the scroll", async () => {
		let done = false;
		appState.navResolvers = [() => (done = true)];
		let scroll!: () => void;
		drainNavResolvers(new Promise<void>((r) => (scroll = r)));
		expect(appState.navResolvers.length).toBe(0);
		await Promise.resolve();
		expect(done).toBe(false);
		scroll();
		await Promise.resolve();
		await Promise.resolve();
		expect(done).toBe(true);
	});
});
