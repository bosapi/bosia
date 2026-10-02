import { describe, test, expect, beforeAll, afterAll, setDefaultTimeout } from "bun:test";
import { join } from "path";

import { getEphemeralPort } from "../../../packages/bosia/src/core/prerender.ts";

// Drives the demo in a real headless browser (Bun.WebView), in prod and dev.
// Run with `bun run test:ui` from apps/demo. The `.e2e.ts` name keeps it out of
// plain `bun test`, so CI and the package suite never pick it up.
//
// WebKit backend only, so macOS only: the constructor throws elsewhere. Pass
// `backend: "chrome"` if this ever moves to CI.
// Uncaught page exceptions don't reach the `console` capture (WebView has no
// init-script hook), so broken hydration shows up as the `hydrated` wait
// timing out instead of as a console error.

const DEMO = join(import.meta.dir, "..");

// Longer than waitFor's 10s: a test that times out mid-poll leaves an evaluate()
// in flight, and the next test's evaluate() then throws ERR_INVALID_STATE.
setDefaultTimeout(15_000);

async function run(cmd: string[], env: Record<string, string> = {}) {
	const proc = Bun.spawn(cmd, {
		cwd: DEMO,
		env: { ...process.env, ...env },
		stdout: "pipe",
		stderr: "pipe",
	});
	const [code, out, err] = await Promise.all([
		proc.exited,
		new Response(proc.stdout).text(),
		new Response(proc.stderr).text(),
	]);
	if (code !== 0) throw new Error(`${cmd.join(" ")} failed (${code})\n${out}\n${err}`);
}

describe.each(["prod", "dev"] as const)("%s", (mode) => {
	let server: Bun.Subprocess | null = null;
	let view: Bun.WebView;
	let origin: string;
	const errors: string[] = [];

	beforeAll(async () => {
		if (mode === "prod") await run(["bun", "run", "build"], { NODE_ENV: "production" });

		// Dev also takes PORT+1 for its internal app server; a collision there is rare.
		const port = await getEphemeralPort();
		origin = `http://localhost:${port}`;
		// Spawn the server itself, not `bun run start`: the script wrapper doesn't
		// pass SIGTERM through, so teardown hung and left the server orphaned.
		const entry = mode === "prod" ? "dist/server/index.js" : "../../packages/bosia/src/core/dev.ts";
		server = Bun.spawn(["bun", "run", entry], {
			cwd: DEMO,
			env: {
				...process.env,
				PORT: String(port),
				NODE_ENV: mode === "prod" ? "production" : "development",
			},
			stdout: "ignore",
			stderr: "ignore",
		});

		const deadline = Date.now() + 90_000;
		while (true) {
			try {
				if ((await fetch(`${origin}/_health`)).ok) break;
			} catch {
				/* not up yet */
			}
			if (Date.now() > deadline) throw new Error(`${mode} server never became ready`);
			await Bun.sleep(100);
		}

		view = new Bun.WebView({
			width: 1280,
			height: 800,
			console: (type, ...args) => {
				if (type === "error") errors.push(args.map(String).join(" "));
			},
		});
	}, 180_000);

	afterAll(async () => {
		view?.close();
		server?.kill();
		await server?.exited;
	});

	/** Poll a page expression until it's truthy. Evaluate can throw mid-navigation. */
	async function waitFor(expr: string, ms = 10_000) {
		const deadline = Date.now() + ms;
		while (Date.now() < deadline) {
			try {
				if (await view.evaluate(expr)) return;
			} catch {
				/* navigating */
			}
			await Bun.sleep(50);
		}
		throw new Error(`timed out waiting for: ${expr}`);
	}

	async function open(path: string) {
		errors.length = 0;
		await view.navigate(origin + path);
		await waitFor("'hydrated' in document.documentElement.dataset");
	}

	const pathIs = (path: string) => `location.pathname === ${JSON.stringify(path)}`;
	const hasText = (text: string) => `document.body.innerText.includes(${JSON.stringify(text)})`;

	// A window global survives client navigation and dies on a full reload.
	const markSpa = () => view.evaluate("window.__spa = 1");
	const stillSpa = async () => expect(await view.evaluate("window.__spa === 1")).toBe(true);

	for (const path of ["/", "/about", "/blog", "/nav-test", "/actions-test"]) {
		test(`${path} hydrates with no console errors`, async () => {
			await open(path);
			expect(errors).toEqual([]);
		});
	}

	test("link click navigates client-side and syncs the title", async () => {
		await open("/nav-test");
		await markSpa();
		await view.click('a[href="/about"]');
		await waitFor(pathIs("/about"));
		await waitFor(`document.title === "About | Bosia Demo"`);
		await stillSpa();

		await view.evaluate("history.back()");
		await waitFor(pathIs("/nav-test"));
		await waitFor(hasText("Navigation patterns"));
		await stillSpa();
		expect(errors).toEqual([]);
	});

	test("enhanced form action shows its success data", async () => {
		await open("/actions-test");
		await markSpa();
		await view.click("#name");
		await view.type("Jeki");
		await view.click("#email");
		await view.type("jeki@bosia.dev");
		await view.click('form:not([action]) button[type="submit"]');
		await waitFor(hasText("Welcome, Jeki (jeki@bosia.dev)!"));
		await stillSpa();
		expect(errors).toEqual([]);
	});

	test("enhanced form action shows fail() errors", async () => {
		await open("/actions-test");
		await view.click('form:not([action]) button[type="submit"]');
		await waitFor(hasText("Name is required"));
		expect(errors).toEqual([]);
	});

	test("named action runs", async () => {
		await open("/actions-test");
		await view.click('form[action="?/reset"] button');
		await waitFor(hasText("Form cleared."));
		expect(errors).toEqual([]);
	});

	test("guarded link click lands on the login page", async () => {
		await open("/guard-test");
		await view.click('a[href="/guard-test/panel"]:not([rel])');
		await waitFor(pathIs("/guard-test/login"));
		expect(errors).toEqual([]);
	});

	test("catch-all route shows its segments", async () => {
		await open("/all/a/b");
		await waitFor(`${hasText("[0] a")} && ${hasText("[1] b")}`);
		expect(errors).toEqual([]);
	});
});
