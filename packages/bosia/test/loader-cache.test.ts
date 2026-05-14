import { describe, expect, test } from "bun:test";
import {
	captureSnapshot,
	shouldRerun,
	type CacheEntry,
	type DirtyState,
	type EvalContext,
} from "../src/core/client/loaderCache.ts";
import type { LoaderDeps } from "../src/core/hooks.ts";

function emptyDeps(): LoaderDeps {
	return { keys: [], urls: [], params: [], searchParams: [], cookies: [], uses_url: false };
}

function emptyDirty(): DirtyState {
	return { all: false, keys: new Set(), urls: new Set(), urlMatchers: [] };
}

function ctx(opts: {
	pathname?: string;
	params?: Record<string, string>;
	search?: string;
	cookies?: Record<string, string>;
}): EvalContext {
	const pathname = opts.pathname ?? "/";
	const url = new URL(`http://localhost${pathname}${opts.search ?? ""}`);
	return {
		pathname,
		params: opts.params ?? {},
		url,
		cookies: opts.cookies ?? {},
	};
}

function entry(deps: LoaderDeps, snap: EvalContext): CacheEntry {
	return {
		nodeId: "test",
		data: {},
		deps,
		snapshot: captureSnapshot(deps, snap),
	};
}

describe("captureSnapshot", () => {
	test("only records keys mentioned in deps", () => {
		const deps: LoaderDeps = {
			...emptyDeps(),
			params: ["slug"],
			searchParams: ["q"],
			cookies: ["session"],
		};
		const snap = captureSnapshot(
			deps,
			ctx({
				params: { slug: "foo", other: "ignored" },
				search: "?q=hello&extra=ignored",
				cookies: { session: "abc", other: "ignored" },
			}),
		);
		expect(snap.params).toEqual({ slug: "foo" });
		expect(snap.searchParams).toEqual({ q: "hello" });
		expect(snap.cookies).toEqual({ session: "abc" });
	});

	test("missing searchParam captured as null", () => {
		const deps: LoaderDeps = { ...emptyDeps(), searchParams: ["q"] };
		const snap = captureSnapshot(deps, ctx({ search: "" }));
		expect(snap.searchParams).toEqual({ q: null });
	});
});

describe("shouldRerun", () => {
	test("zero deps → never re-runs", () => {
		const e = entry(emptyDeps(), ctx({ pathname: "/", params: { a: "1" } }));
		const result = shouldRerun(
			e,
			emptyDirty(),
			ctx({ pathname: "/about", params: { a: "2" } }),
		);
		expect(result).toBe(false);
	});

	test("re-runs when a tracked param changes", () => {
		const deps: LoaderDeps = { ...emptyDeps(), params: ["slug"] };
		const e = entry(deps, ctx({ params: { slug: "foo" } }));
		expect(shouldRerun(e, emptyDirty(), ctx({ params: { slug: "foo" } }))).toBe(false);
		expect(shouldRerun(e, emptyDirty(), ctx({ params: { slug: "bar" } }))).toBe(true);
	});

	test("does NOT re-run when an untracked param changes", () => {
		const deps: LoaderDeps = { ...emptyDeps(), params: ["slug"] };
		const e = entry(deps, ctx({ params: { slug: "foo", other: "x" } }));
		expect(shouldRerun(e, emptyDirty(), ctx({ params: { slug: "foo", other: "y" } }))).toBe(
			false,
		);
	});

	test("re-runs when a tracked searchParam changes", () => {
		const deps: LoaderDeps = { ...emptyDeps(), searchParams: ["q"] };
		const e = entry(deps, ctx({ search: "?q=hello" }));
		expect(shouldRerun(e, emptyDirty(), ctx({ search: "?q=hello" }))).toBe(false);
		expect(shouldRerun(e, emptyDirty(), ctx({ search: "?q=bye" }))).toBe(true);
	});

	test("re-runs when an untracked searchParam doesn't matter", () => {
		const deps: LoaderDeps = { ...emptyDeps(), searchParams: ["q"] };
		const e = entry(deps, ctx({ search: "?q=hello&z=1" }));
		expect(shouldRerun(e, emptyDirty(), ctx({ search: "?q=hello&z=2" }))).toBe(false);
	});

	test("re-runs when uses_url and pathname changes", () => {
		const deps: LoaderDeps = { ...emptyDeps(), uses_url: true };
		const e = entry(deps, ctx({ pathname: "/foo" }));
		expect(shouldRerun(e, emptyDirty(), ctx({ pathname: "/foo" }))).toBe(false);
		expect(shouldRerun(e, emptyDirty(), ctx({ pathname: "/bar" }))).toBe(true);
	});

	test("re-runs when a tracked cookie changes", () => {
		const deps: LoaderDeps = { ...emptyDeps(), cookies: ["session"] };
		const e = entry(deps, ctx({ cookies: { session: "abc" } }));
		expect(shouldRerun(e, emptyDirty(), ctx({ cookies: { session: "abc" } }))).toBe(false);
		expect(shouldRerun(e, emptyDirty(), ctx({ cookies: { session: "def" } }))).toBe(true);
	});

	test("re-runs on dirty.keys match", () => {
		const deps: LoaderDeps = { ...emptyDeps(), keys: ["app:user"] };
		const e = entry(deps, ctx({}));
		const dirty: DirtyState = { ...emptyDirty(), keys: new Set(["app:user"]) };
		expect(shouldRerun(e, dirty, ctx({}))).toBe(true);
	});

	test("does NOT re-run on dirty.keys mismatch", () => {
		const deps: LoaderDeps = { ...emptyDeps(), keys: ["app:user"] };
		const e = entry(deps, ctx({}));
		const dirty: DirtyState = { ...emptyDirty(), keys: new Set(["app:other"]) };
		expect(shouldRerun(e, dirty, ctx({}))).toBe(false);
	});

	test("re-runs on dirty.urls exact match", () => {
		const deps: LoaderDeps = { ...emptyDeps(), urls: ["http://localhost/api/posts"] };
		const e = entry(deps, ctx({}));
		const dirty: DirtyState = {
			...emptyDirty(),
			urls: new Set(["http://localhost/api/posts"]),
		};
		expect(shouldRerun(e, dirty, ctx({}))).toBe(true);
	});

	test("re-runs on dirty.urlMatchers predicate match", () => {
		const deps: LoaderDeps = { ...emptyDeps(), urls: ["http://localhost/api/posts/1"] };
		const e = entry(deps, ctx({}));
		const dirty: DirtyState = {
			...emptyDirty(),
			urlMatchers: [(u) => u.pathname.startsWith("/api/")],
		};
		expect(shouldRerun(e, dirty, ctx({}))).toBe(true);
	});

	test("does NOT re-run when matcher misses", () => {
		const deps: LoaderDeps = { ...emptyDeps(), urls: ["http://localhost/api/posts/1"] };
		const e = entry(deps, ctx({}));
		const dirty: DirtyState = {
			...emptyDirty(),
			urlMatchers: [(u) => u.pathname.startsWith("/other/")],
		};
		expect(shouldRerun(e, dirty, ctx({}))).toBe(false);
	});

	test("dirty.all wins over everything", () => {
		const e = entry(emptyDeps(), ctx({}));
		const dirty: DirtyState = { ...emptyDirty(), all: true };
		expect(shouldRerun(e, dirty, ctx({}))).toBe(true);
	});

	test("re-runs on broad cookie sentinel '*'", () => {
		const deps: LoaderDeps = { ...emptyDeps(), cookies: ["*"] };
		const e = entry(deps, ctx({ cookies: { a: "1" } }));
		expect(shouldRerun(e, emptyDirty(), ctx({ cookies: { a: "1" } }))).toBe(true);
	});
});

describe("server bitmask decoding", () => {
	// Mirror the helper in server.ts so we can test its semantics without
	// pulling the whole Elysia module into the test harness.
	function buildMaskFromBits(bits: string, layoutCount: number) {
		const page = bits[0] !== "0";
		const layouts: boolean[] = [];
		for (let i = 0; i < layoutCount; i++) layouts.push(bits[i + 1] !== "0");
		return { page, layouts };
	}

	test("'10' with 1 layout → page=true, layout=false", () => {
		expect(buildMaskFromBits("10", 1)).toEqual({ page: true, layouts: [false] });
	});

	test("'01' with 1 layout → page=false, layout=true", () => {
		expect(buildMaskFromBits("01", 1)).toEqual({ page: false, layouts: [true] });
	});

	test("'111' with 2 layouts → run everything", () => {
		expect(buildMaskFromBits("111", 2)).toEqual({ page: true, layouts: [true, true] });
	});

	test("missing bits default to run", () => {
		expect(buildMaskFromBits("1", 2)).toEqual({ page: true, layouts: [true, true] });
	});
});
