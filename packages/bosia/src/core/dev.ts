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

// Host-managed mode: when a host (rukoku) sets BOSIA_DEV_MANAGED=1 in the unit
// env, this dev server never self-triggers builds on file change — the host is
// the single clock and drives one rebuild per turn via POST /__bosia/rebuild
// (avoids the watcher compiling a half-written file mid-edit). Unset → normal
// `bosia dev` is byte-for-byte unchanged.
const MANAGED = process.env.BOSIA_DEV_MANAGED === "1";

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

// Reload-hold control (driven by titoko via /__bosia/hold + /__bosia/resume).
// While held, rebuilds keep happening (latest code stays ready) but the reload
// broadcast is suppressed; on resume a single reload is flushed if any rebuild
// fired meanwhile. Defaults to off, so a plain `bosia dev` developer never sees
// any behaviour change.
let reloadHeld = false;
let reloadQueuedWhileHeld = false;
let holdSafetyTimer: ReturnType<typeof setTimeout> | null = null;
// Safety net for a *dead* orchestrator only — NOT a task duration cap. While an
// agent run is healthy the orchestrator heartbeats `/__bosia/hold` (re-arming
// this timer), so it never fires mid-task no matter how long the task runs. It
// fires only if the heartbeats stop (titoko crash, network partition), so a
// missed resume can't freeze the preview forever. Must comfortably exceed the
// heartbeat interval so one dropped ping doesn't trip it.
const HOLD_SAFETY_MS = 90_000;

function broadcastReload() {
	if (reloadHeld) {
		reloadQueuedWhileHeld = true;
		return;
	}
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

// 503 body served while the inner app server is mid-restart (rebuild after an
// edit). Must be HTML carrying the SAME SSE reload client as the dev-500 page —
// the bare text/plain version had no live `/__bosia/sse` connection, so once an
// iframe landed here (e.g. a reload racing into a rebuild window) it stayed stuck
// until a manual reload. With the client, the next `broadcastReload()` once the
// app binds reloads this page automatically. Keep the literal phrase
// "App server is starting" in the body: titoko's proxy retry matches on it.
const STARTING_PAGE = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Starting…</title>
  <style>
    html,body{margin:0;padding:0;height:100%;background:#0a0a0a;color:#e5e5e5;font:14px/1.5 ui-sans-serif,system-ui,-apple-system,sans-serif}
    .wrap{min-height:100%;display:flex;align-items:center;justify-content:center;padding:24px;box-sizing:border-box}
    .dot{display:inline-block;width:10px;height:10px;background:#16a34a;border-radius:50%;margin-right:8px;vertical-align:middle;animation:p 1.4s ease-in-out infinite}
    @keyframes p{0%,100%{opacity:1}50%{opacity:.3}}
    h1{font-size:16px;font-weight:600;margin:0}
  </style>
</head>
<body>
  <div class="wrap"><h1><span class="dot"></span>App server is starting…</h1></div>
  <script>
    !function r(){
      try{
        var e=new EventSource("/__bosia/sse");
        e.addEventListener("reload",function(){location.reload()});
        e.onerror=function(){e.close();setTimeout(r,2000)};
      }catch(_){setTimeout(r,2000)}
    }();
  </script>
</body>
</html>`;

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

async function buildAndRestart(): Promise<boolean> {
	if (building) {
		buildPending = true;
		// ponytail: coalesced into the in-flight build. Managed mode fires one
		// rebuild per turn so overlap is rare; report optimistic rather than a
		// false build failure to the host.
		return true;
	}
	building = true;
	try {
		let ok = true;
		do {
			buildPending = false;
			ok = await runBuild();
			if (!ok) {
				console.error("❌ Build failed — fix errors and save again");
				return false;
			}
			await startAppServer();
			// Give the app server a moment to bind its port
			await Bun.sleep(200);
			broadcastReload();
		} while (buildPending);
		return ok;
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

		// Reload-hold control — host orchestrator (titoko) brackets an AI agent run
		// so the preview reloads once when the agent finishes, not once per file
		// edit. Both routes are idempotent and return small JSON.
		//
		// POST /__bosia/hold doubles as the heartbeat: the FIRST hold opens a fresh
		// window (clears any stale queued reload); subsequent holds only re-arm the
		// safety timer and MUST preserve `reloadQueuedWhileHeld`, or a heartbeat
		// landing after a suppressed rebuild would drop the pending reload and
		// resume would flush nothing.
		if (url.pathname === "/__bosia/hold" && req.method === "POST") {
			if (!reloadHeld) {
				reloadHeld = true;
				reloadQueuedWhileHeld = false;
			}
			if (holdSafetyTimer) clearTimeout(holdSafetyTimer);
			holdSafetyTimer = setTimeout(() => {
				holdSafetyTimer = null;
				if (!reloadHeld) return;
				console.warn("⏱️  Reload hold safety timeout — auto-resuming");
				reloadHeld = false;
				if (reloadQueuedWhileHeld) {
					reloadQueuedWhileHeld = false;
					broadcastReload();
				}
			}, HOLD_SAFETY_MS);
			holdSafetyTimer.unref?.();
			return Response.json({ ok: true, held: true });
		}

		if (url.pathname === "/__bosia/resume" && req.method === "POST") {
			if (holdSafetyTimer) {
				clearTimeout(holdSafetyTimer);
				holdSafetyTimer = null;
			}
			reloadHeld = false;
			const flushed = reloadQueuedWhileHeld;
			reloadQueuedWhileHeld = false;
			if (flushed) broadcastReload();
			return Response.json({ ok: true, held: false, flushed });
		}

		// Host-managed rebuild trigger. In managed mode the watcher is off, so the
		// host (rukoku) POSTs here once per turn after all file writes are done.
		// Reuses the single-flight building/buildPending guards. The POST awaits the
		// full build; `{ ok }` is the real build result (compiler errors stream to
		// stdout/stderr → journald, which the host tails on ok:false). Exists in
		// both modes; simply unused when the watcher is on.
		if (url.pathname === "/__bosia/rebuild" && req.method === "POST") {
			const ok = await buildAndRestart();
			return Response.json({ ok });
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

		// Preserve an X-Forwarded-* set by an OUTER proxy (e.g. a multi-tenant host
		// fronting `bun run dev` behind TLS). Overwriting it with this dev proxy's
		// own loopback host/scheme would strip the real public origin, so the app's
		// redirects and `event.url` would point at localhost. Fall back to this
		// proxy's request only when the outer hop didn't set them.
		const forwardedHeaders = new Headers(req.headers);
		forwardedHeaders.set("x-forwarded-host", req.headers.get("x-forwarded-host") ?? reqUrl.host);
		forwardedHeaders.set(
			"x-forwarded-proto",
			req.headers.get("x-forwarded-proto") ?? reqUrl.protocol.replace(":", ""),
		);
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
				return new Response(STARTING_PAGE, {
					status: 503,
					headers: { "Content-Type": "text/html; charset=utf-8", "Retry-After": "1" },
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

// Managed mode: the host is the single clock, so never self-trigger on file
// change. Leave both watchers unstarted (null) — boot build + startAppServer
// still run, so the server builds once and serves; it just waits for the host's
// POST /__bosia/rebuild instead of watching.
let srcWatcher: ReturnType<typeof watch> | null = null;
let mtimePoll: ReturnType<typeof setInterval> | null = null;

if (!MANAGED) {
	srcWatcher = watch(join(process.cwd(), "src"), { recursive: true }, (_event, filename) => {
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
}

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

if (!MANAGED) {
	mtimePoll = setInterval(() => {
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
}

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

console.log(
	MANAGED
		? "🛰️  Host-managed mode — builds driven by POST /__bosia/rebuild\n"
		: "👀 Watching src/ for changes...\n",
);

// ─── Shutdown ─────────────────────────────────────────────
// Own SIGINT/SIGTERM so we can cleanly stop the child app server.
// Without this, the terminal's ^C reaches both processes; the parent
// exits instantly while the child blocks in `app.stop()`, requiring
// a second ^C.

let shuttingDown = false;
let firstSignalAt = 0;
async function shutdown() {
	if (shuttingDown) {
		// One ^C arrives multiple times (process group + `bun run` forwarding
		// to its child) — only a genuinely later signal is a second ^C.
		if (Date.now() - firstSignalAt > 200) process.exit(130); // second ^C = force quit
		return;
	}
	shuttingDown = true;
	firstSignalAt = Date.now();
	intentionalKill = true;

	if (buildTimer) clearTimeout(buildTimer);
	if (restartTimer) clearTimeout(restartTimer);
	if (healthyTimer) clearTimeout(healthyTimer);
	if (mtimePoll) clearInterval(mtimePoll);
	srcWatcher?.close();
	envWatcher.close();
	devServer.stop(true); // closes SSE conns → abort listeners clear ping intervals

	if (appProcess) {
		appProcess.kill("SIGTERM");
		await Promise.race([appProcess.exited, Bun.sleep(2_500)]);
	}

	// Everything is stopped — exit now rather than waiting for the loop to drain.
	process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
