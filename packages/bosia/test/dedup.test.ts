import { describe, expect, test } from "bun:test";
import { dedup, dedupKey } from "../src/core/dedup.ts";
import { join } from "path";
import { pathToFileURL } from "url";

describe("dedupKey()", () => {
	test("returns pathname when no query", () => {
		expect(dedupKey(new URL("https://x.test/blog"))).toBe("/blog");
	});

	test("normalizes trailing slash on non-root paths", () => {
		expect(dedupKey(new URL("https://x.test/blog/"))).toBe("/blog");
	});

	test("preserves root /", () => {
		expect(dedupKey(new URL("https://x.test/"))).toBe("/");
	});

	test("sorts query params for stable keys", () => {
		const a = dedupKey(new URL("https://x.test/list?b=2&a=1"));
		const b = dedupKey(new URL("https://x.test/list?a=1&b=2"));
		expect(a).toBe(b);
		expect(a).toBe("/list?a=1&b=2");
	});

	test("different paths produce different keys", () => {
		expect(dedupKey(new URL("https://x.test/a"))).not.toBe(dedupKey(new URL("https://x.test/b")));
	});
});

describe("dedup()", () => {
	test("concurrent calls with same key share one inflight promise", async () => {
		let calls = 0;
		const fn = async () => {
			calls++;
			await Bun.sleep(20);
			return "result";
		};
		const [a, b, c] = await Promise.all([dedup("k", fn), dedup("k", fn), dedup("k", fn)]);
		expect(calls).toBe(1);
		expect(a).toBe("result");
		expect(b).toBe("result");
		expect(c).toBe("result");
	});

	test("different keys do not share", async () => {
		let calls = 0;
		const fn = async () => {
			calls++;
			return calls;
		};
		await Promise.all([dedup("a", fn), dedup("b", fn)]);
		expect(calls).toBe(2);
	});

	test("entry removed after settle so subsequent calls re-run", async () => {
		let calls = 0;
		const fn = async () => {
			calls++;
			return calls;
		};
		await dedup("k2", fn);
		await dedup("k2", fn);
		expect(calls).toBe(2);
	});

	test("entry removed even when fn rejects", async () => {
		let calls = 0;
		const fn = async () => {
			calls++;
			throw new Error("boom");
		};
		await expect(dedup("k3", fn)).rejects.toThrow("boom");
		await expect(dedup("k3", fn)).rejects.toThrow("boom");
		expect(calls).toBe(2);
	});

	test("a call older than maxAgeMs isn't joined, and its late finish keeps the new one", async () => {
		let release!: () => void;
		const stuck = dedup("k4", () => new Promise<string>((r) => (release = () => r("old"))), 80);
		await Bun.sleep(90);
		let runs = 0;
		const fresh = () => {
			runs++;
			return new Promise<string>((r) => setTimeout(() => r("new"), 20));
		};
		const a = dedup("k4", fresh, 80);
		release();
		await stuck;
		// The old call settled; the new one is still in flight and still joined.
		const b = dedup("k4", fresh, 80);
		expect(await a).toBe("new");
		expect(await b).toBe("new");
		expect(runs).toBe(1);
	});
});

describe("a stuck build past CACHE_WAIT_TIMEOUT", () => {
	// CACHE_WAIT_TIMEOUT is read at import, so this runs in its own process.
	test("one waiter rebuilds, the rest share it, and none joins the stuck dedup() call", async () => {
		const script = `
			const { cacheSet, claimMiss, coalesceMiss } = await import(${JSON.stringify(pathToFileURL(join(import.meta.dir, "../src/core/cache.ts")).href)});
			const { dedup } = await import(${JSON.stringify(pathToFileURL(join(import.meta.dir, "../src/core/dedup.ts")).href)});
			const leader = coalesceMiss("k");
			dedup("k", () => new Promise(() => {}), 40);
			// Same steps as the data endpoint: claim, dedup (replacing a stuck
			// call when leading in its place), write, release.
			let builds = 0;
			const build = () => (builds++, Bun.sleep(20).then(() => "ok"));
			const entry = () => ({ raw: new TextEncoder().encode("ok"), gzip: null, brotli: null,
				contentType: "text/plain", status: 200, extraHeaders: {}, tags: [] });
			const run = async () => {
				const claim = await claimMiss("k");
				if (claim.hit) return "ok";
				const out = await dedup("k", build, 40, claim.lead?.stale ? claim.lead.staleStart + 1000 : -Infinity);
				if (claim.lead) {
					cacheSet("k", entry());
					claim.lead.release();
				}
				return out;
			};
			const timeout = new Promise((r) => setTimeout(() => r("hung"), 1000));
			const waiters = await Promise.race([Promise.all(Array.from({ length: 20 }, run)), timeout]);
			const waiterBuilds = builds;
			const next = await Promise.race([run(), timeout]);
			// A request that joins a stuck call still gives up at maxAgeMs.
			let runs = 0;
			dedup("j", () => new Promise(() => {}), 40);
			const joiners = await Promise.race([
				Promise.all(Array.from({ length: 5 }, () => dedup("j", () => (runs++, Bun.sleep(20).then(() => "ok")), 40))),
				timeout,
			]);
			// The replacement hangs too: waiters give up after a second expiry.
			coalesceMiss("r");
			const claims = await Promise.race([
				Promise.all(Array.from({ length: 3 }, () => claimMiss("r"))),
				timeout,
			]);
			const shape = claims.map((c) => (c.lead ? (c.lead.stale ? "stale" : "lead") : "alone"));
			// A client that left while waiting doesn't build.
			coalesceMiss("a");
			const ac = new AbortController();
			ac.abort();
			const left = await claimMiss("a", ac.signal);
			console.log(JSON.stringify({ waiters, next, waiterBuilds, joiners, runs, shape, aborted: left.aborted === true, leader: typeof leader.release }));
		`;
		const proc = Bun.spawn(["bun", "-e", script], {
			env: { ...process.env, CACHE_WAIT_TIMEOUT: "40" },
			stdout: "pipe",
			stderr: "pipe",
		});
		const out = await new Response(proc.stdout).text();
		await proc.exited;
		const line = out.trim().split("\n").pop()!;
		const result = JSON.parse(line);
		expect(result.waiters).toEqual(Array(20).fill("ok"));
		expect(result.next).toBe("ok");
		// One new build when the gate expired, not one per waiter.
		expect(result.waiterBuilds).toBe(1);
		expect(result.joiners).toEqual(Array(5).fill("ok"));
		expect(result.runs).toBe(1);
		expect(result.shape.sort()).toEqual(["alone", "alone", "stale"]);
		expect(result.aborted).toBe(true);
	});
});
