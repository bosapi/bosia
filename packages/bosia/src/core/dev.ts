import { spawn, type Subprocess } from "bun";
import { readdirSync, statSync, watch, type Dirent } from "fs";
import { join } from "path";
import { loadEnv, resetDeclaredKeys } from "./env.ts";
import { BOSIA_NODE_PATH } from "./paths.ts";

// Dev always writes to .bosia/dev so a parallel `bun run build` (writing to ./dist)
// can't clobber the live preview. Hardcoded — BOSIA_OUT_DIR is a build-mode knob,
// not a dev knob; we pass it to spawned children to redirect build.ts/server output,
// but dev.ts itself never reads it.
const DEV_OUT_DIR = ".bosia/dev";

// Snapshot pure shell env BEFORE any loadEnv call pollutes process.env.
// On `.env*` change we restore from this snapshot, then re-run loadEnv,
// so removed/renamed keys no longer linger in the dev process.
const SHELL_ENV_SNAPSHOT: Record<string, string | undefined> = { ...process.env };

loadEnv("development");

function reloadEnv() {
	for (const k of Object.keys(process.env)) delete process.env[k];
	for (const [k, v] of Object.entries(SHELL_ENV_SNAPSHOT)) {
		if (v !== undefined) process.env[k] = v;
	}
	resetDeclaredKeys();
	loadEnv("development");
}

console.log("⬡ Bosia dev server starting...\n");

// ─── State ────────────────────────────────────────────────

let appProcess: Subprocess | null = null;
let sseClients = new Set<ReadableStreamDefaultController>();
let intentionalKill = false;
let crashCount = 0;
let restartTimer: ReturnType<typeof setTimeout> | null = null;
let healthyTimer: ReturnType<typeof setTimeout> | null = null;
const HEALTHY_AFTER_MS = 5_000;
// Exponential backoff between successive crash restarts (capped at last value).
const BACKOFF_SCHEDULE_MS = [500, 1_000, 2_000, 4_000, 5_000];

// ─── SSE Broadcast ────────────────────────────────────────

function broadcastReload() {
	const msg = new TextEncoder().encode("event: reload\ndata: ok\n\n");
	for (const ctrl of sseClients) {
		try {
			ctrl.enqueue(msg);
		} catch {
			sseClients.delete(ctrl);
		}
	}
	if (sseClients.size > 0) {
		console.log(`📡 Reload sent to ${sseClients.size} client(s)`);
	}
}

// ─── Build ────────────────────────────────────────────────

const BUILD_SCRIPT = join(import.meta.dir, "build.ts");

async function runBuild(): Promise<boolean> {
	console.log("🏗️  Building...");
	const proc = spawn(["bun", "run", BUILD_SCRIPT], {
		stdout: "inherit",
		stderr: "inherit",
		cwd: process.cwd(),
		env: { ...process.env, BOSIA_OUT_DIR: DEV_OUT_DIR },
	});
	return (await proc.exited) === 0;
}

// ─── Ports ────────────────────────────────────────────────

const DEV_PORT = Number(process.env.PORT) || 9000;
const APP_PORT = DEV_PORT + 1; // internal, hidden from user

async function startAppServer() {
	if (appProcess) {
		intentionalKill = true;
		appProcess.kill();
		await appProcess.exited;
		intentionalKill = false;
	}

	// Read the server entry filename from the manifest written by build.ts
	let serverEntry = "index.js";
	try {
		const manifest = await Bun.file(`${DEV_OUT_DIR}/manifest.json`).json();
		serverEntry = manifest.serverEntry ?? "index.js";
	} catch {}

	if (healthyTimer) {
		clearTimeout(healthyTimer);
		healthyTimer = null;
	}

	appProcess = spawn(["bun", "run", `${DEV_OUT_DIR}/server/${serverEntry}`], {
		stdout: "inherit",
		stderr: "inherit",
		cwd: process.cwd(),
		env: {
			...process.env,
			NODE_ENV: "development",
			// Force app server to APP_PORT — prevents PORT from .env conflicting with the dev proxy
			PORT: String(APP_PORT),
			// Allow externalized deps (elysia, etc.) to resolve from bosia's node_modules
			NODE_PATH: BOSIA_NODE_PATH,
			// Point the server child at dev's output dir so its OUT_DIR reads match what build wrote.
			BOSIA_OUT_DIR: DEV_OUT_DIR,
			// Dev proxy injects X-Forwarded-Host/Proto reflecting the public DEV_PORT, so CSRF
			// origin checks must honour them. Safe in dev because the proxy controls these
			// headers — no untrusted client can spoof them.
			TRUST_PROXY: "true",
		},
	});

	// Once the child has stayed alive past HEALTHY_AFTER_MS, treat it as a successful
	// boot and zero the backoff counter so the next crash starts at 500ms again.
	const proc = appProcess;
	healthyTimer = setTimeout(() => {
		if (proc === appProcess && !intentionalKill) crashCount = 0;
	}, HEALTHY_AFTER_MS);
	healthyTimer.unref?.();

	// Monitor for unexpected crashes. Never give up — backoff and keep trying.
	// A real source-level crash bug will surface as repeated restart logs; the
	// moment the user (or AI) fixes it, the next file event triggers a fresh
	// rebuild and the loop unwinds naturally.
	proc.exited.then((code) => {
		if (proc !== appProcess || intentionalKill) return;
		if (code === 0) return; // clean exit

		if (healthyTimer) {
			clearTimeout(healthyTimer);
			healthyTimer = null;
		}

		const delay =
			BACKOFF_SCHEDULE_MS[Math.min(crashCount, BACKOFF_SCHEDULE_MS.length - 1)] ??
			BACKOFF_SCHEDULE_MS[BACKOFF_SCHEDULE_MS.length - 1]!;
		crashCount++;

		console.warn(
			`\n⚠️  App crashed (exit code ${code}). Restart attempt #${crashCount} in ${delay}ms...\n`,
		);

		if (restartTimer) clearTimeout(restartTimer);
		restartTimer = setTimeout(() => {
			restartTimer = null;
			startAppServer();
		}, delay);
		restartTimer.unref?.();
	});
}

// ─── Build & Restart ──────────────────────────────────────

let buildTimer: ReturnType<typeof setTimeout> | null = null;
let building = false;
let buildPending = false;

async function buildAndRestart() {
	if (building) {
		buildPending = true;
		return;
	}
	building = true;
	try {
		do {
			buildPending = false;
			const ok = await runBuild();
			if (!ok) {
				console.error("❌ Build failed — fix errors and save again");
				return;
			}
			await startAppServer();
			// Give the app server a moment to bind its port
			await Bun.sleep(200);
			broadcastReload();
		} while (buildPending);
	} finally {
		building = false;
	}
}

function scheduleBuild() {
	if (buildTimer) clearTimeout(buildTimer);
	buildTimer = setTimeout(buildAndRestart, 300);
}

// ─── Dev Proxy ────────────────────────────────────────────
// Owns the SSE connection so it survives app server restarts.
// All other requests are proxied to the app server.

const devServer = Bun.serve({
	port: DEV_PORT,
	idleTimeout: 255,
	async fetch(req) {
		const url = new URL(req.url);

		// SSE endpoint — owned by dev server, not the app
		if (url.pathname === "/__bosia/sse") {
			return new Response(
				new ReadableStream({
					start(ctrl) {
						sseClients.add(ctrl);
						// Initial keepalive so the browser knows the connection is open
						ctrl.enqueue(new TextEncoder().encode(":ok\n\n"));

						// Ping every 25s to prevent idle timeout
						const ping = setInterval(() => {
							try {
								ctrl.enqueue(new TextEncoder().encode(":ping\n\n"));
							} catch {
								clearInterval(ping);
								sseClients.delete(ctrl);
							}
						}, 25_000);

						req.signal.addEventListener("abort", () => {
							clearInterval(ping);
							sseClients.delete(ctrl);
						});
					},
				}),
				{
					headers: {
						"Content-Type": "text/event-stream; charset=utf-8",
						"Cache-Control": "no-cache",
						Connection: "keep-alive",
					},
				},
			);
		}

		// Proxy everything else to the app server. Inject X-Forwarded-Host/Proto so
		// the app's CSRF origin check (gated behind TRUST_PROXY=true, also set in the
		// app env above) reconstructs the public-facing origin from the dev proxy
		// rather than the inner-app's host (localhost:APP_PORT).
		const reqUrl = new URL(req.url);
		const target = new URL(req.url);
		// 127.0.0.1 instead of "localhost" — under systemd `IPAddressAllow=localhost`
		// the eBPF cgroup filter only permits packets to/from 127.0.0.0/8 + ::1.
		// "localhost" resolves to both ::1 and 127.0.0.1; bun's fetch() picks IPv6
		// first, but the inner Bun.serve() listens IPv4-only, so the v6 connect
		// fails fast and (under bun 1.3) doesn't fall back to v4. Pinning to v4
		// avoids the failure path entirely.
		target.hostname = "127.0.0.1";
		target.port = String(APP_PORT);

		const forwardedHeaders = new Headers(req.headers);
		forwardedHeaders.set("x-forwarded-host", reqUrl.host);
		forwardedHeaders.set("x-forwarded-proto", reqUrl.protocol.replace(":", ""));
		// Force inner app to respond uncompressed. Bun's `fetch()` auto-decodes
		// gzip/br bodies but leaves the original `Content-Encoding` header on
		// the Response, so passing it through made Safari throw -1015 ("cannot
		// decode raw data") on every HTML navigation. Identity on the dev wire
		// is fine — it's localhost.
		forwardedHeaders.set("accept-encoding", "identity");

		// HMR-driven reloads can land on the proxy before the freshly-respawned
		// inner has bound APP_PORT. Retry for a few seconds on idempotent HTML
		// navigations so the browser doesn't get stuck rendering the 503 body.
		const accept = req.headers.get("accept") ?? "";
		const retryable =
			(req.method === "GET" || req.method === "HEAD") && accept.includes("text/html");
		const deadline = Date.now() + (retryable ? 10_000 : 0);

		while (true) {
			try {
				return await fetch(
					new Request(target.toString(), {
						method: req.method,
						headers: forwardedHeaders,
						body: req.body,
						redirect: "manual",
					}),
				);
			} catch {
				if (retryable && Date.now() < deadline) {
					await Bun.sleep(250);
					continue;
				}
				return new Response("App server is starting...", {
					status: 503,
					headers: { "Content-Type": "text/plain", "Retry-After": "1" },
				});
			}
		}
	},
});

// ─── Initial Build ────────────────────────────────────────

await buildAndRestart();

console.log(`\n🌐 Open http://localhost:${DEV_PORT}\n`);

// ─── File Watcher ─────────────────────────────────────────
// Watch src/ recursively. Skip generated files to avoid loops.

const GENERATED = [join(process.cwd(), ".bosia"), join(process.cwd(), "public", "bosia-tw.css")];

function isGenerated(path: string): boolean {
	return GENERATED.some((g) => path.startsWith(g));
}

// ─── mtime Poll Safety Net ────────────────────────────────
// On macOS, fs.watch misses events from atomic writes (temp file + rename)
// and frequently delivers `filename === null` for renames. AI agents that edit
// via rename therefore slip past the fast path. Walk src/ every 5s and call
// scheduleBuild() on any mtime delta or add/delete. The 300ms build debounce
// in scheduleBuild() coalesces this with the fs.watch path when both fire.
//
// IMPORTANT: fs.watch must update mtimes[file] when it fires — otherwise the
// next poll sweep sees the new mtime against a stale seed and fires a duplicate
// scheduleBuild() for an edit that was already handled.

const SRC_DIR = join(process.cwd(), "src");
const MTIME_POLL_MS = 5_000;
const mtimes = new Map<string, number>();

const srcWatcher = watch(join(process.cwd(), "src"), { recursive: true }, (_event, filename) => {
	if (!filename) return;
	const abs = join(process.cwd(), "src", filename);
	if (isGenerated(abs)) return;
	console.log(`[watch] changed: ${filename}`);
	try {
		mtimes.set(abs, statSync(abs).mtimeMs);
	} catch {
		mtimes.delete(abs);
	}
	scheduleBuild();
});

function walkSrc(out: Map<string, number>): void {
	const stack: string[] = [SRC_DIR];
	while (stack.length > 0) {
		const dir = stack.pop() as string;
		if (isGenerated(dir)) continue;
		let entries: Dirent[];
		try {
			entries = readdirSync(dir, { withFileTypes: true }) as Dirent[];
		} catch {
			continue;
		}
		for (const ent of entries) {
			const name = String(ent.name);
			const abs = join(dir, name);
			if (isGenerated(abs)) continue;
			if (ent.isDirectory()) {
				stack.push(abs);
				continue;
			}
			if (!ent.isFile()) continue;
			try {
				out.set(abs, statSync(abs).mtimeMs);
			} catch {
				// file vanished between readdir and stat — ignore
			}
		}
	}
}

// Seed the map without firing — first sweep just records existing mtimes.
walkSrc(mtimes);

const mtimePoll = setInterval(() => {
	const fresh = new Map<string, number>();
	walkSrc(fresh);

	let changed: string | null = null;

	for (const [path, ts] of fresh) {
		const prev = mtimes.get(path);
		if (prev === undefined || prev !== ts) {
			changed = path;
			break;
		}
	}
	if (!changed) {
		for (const path of mtimes.keys()) {
			if (!fresh.has(path)) {
				changed = path;
				break;
			}
		}
	}

	if (changed) {
		const rel = changed.startsWith(SRC_DIR) ? changed.slice(SRC_DIR.length + 1) : changed;
		console.log(`[poll] changed: ${rel}`);
		mtimes.clear();
		for (const [p, t] of fresh) mtimes.set(p, t);
		scheduleBuild();
	}
}, MTIME_POLL_MS);
mtimePoll.unref?.();

// ─── .env Watcher ─────────────────────────────────────────
// Reset to shell-env snapshot and re-run loadEnv so removed/renamed
// keys don't linger across hot-reloads. The respawn at startAppServer
// already spreads `...process.env`, so the child picks up the fresh state.

const ENV_FILES = new Set([".env", ".env.local", ".env.development", ".env.development.local"]);

const envWatcher = watch(process.cwd(), { recursive: false }, (_event, filename) => {
	if (!filename || !ENV_FILES.has(filename)) return;
	console.log(`[watch] env changed: ${filename}`);
	reloadEnv();
	scheduleBuild();
});

console.log("👀 Watching src/ for changes...\n");

// ─── Shutdown ─────────────────────────────────────────────
// Own SIGINT/SIGTERM so we can cleanly stop the child app server.
// Without this, the terminal's ^C reaches both processes; the parent
// exits instantly while the child blocks in `app.stop()`, requiring
// a second ^C.

let shuttingDown = false;
async function shutdown() {
	if (shuttingDown) return; // re-entry from process-group signals or impatient ^C — drain is already running
	shuttingDown = true;
	intentionalKill = true;

	if (buildTimer) clearTimeout(buildTimer);
	if (restartTimer) clearTimeout(restartTimer);
	if (healthyTimer) clearTimeout(healthyTimer);
	clearInterval(mtimePoll);
	srcWatcher.close();
	envWatcher.close();
	devServer.stop(true); // closes SSE conns → abort listeners clear ping intervals

	if (appProcess) {
		appProcess.kill("SIGTERM");
		await Promise.race([appProcess.exited, Bun.sleep(2_500)]);
	}

	// Safety net: if any stray handle still holds the loop, force clean exit.
	// .unref() so the timer itself doesn't keep the loop alive when drain succeeds.
	setTimeout(() => process.exit(0), 1_500).unref();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
