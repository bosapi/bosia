import { spawn, type Subprocess } from "bun";
import { watch } from "fs";
import { join } from "path";
import { loadEnv, resetDeclaredKeys } from "./env.ts";

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
let lastCrashTime = 0;
const MAX_RAPID_CRASHES = 3;
const RAPID_CRASH_WINDOW = 5_000; // 5 seconds

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

import { BOSIA_NODE_PATH } from "./paths.ts";

const BUILD_SCRIPT = join(import.meta.dir, "build.ts");

async function runBuild(): Promise<boolean> {
	console.log("🏗️  Building...");
	const proc = spawn(["bun", "run", BUILD_SCRIPT], {
		stdout: "inherit",
		stderr: "inherit",
		cwd: process.cwd(),
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
		const manifest = await Bun.file("./dist/manifest.json").json();
		serverEntry = manifest.serverEntry ?? "index.js";
	} catch {}

	appProcess = spawn(["bun", "run", `dist/server/${serverEntry}`], {
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
			// Dev proxy injects X-Forwarded-Host/Proto reflecting the public DEV_PORT, so CSRF
			// origin checks must honour them. Safe in dev because the proxy controls these
			// headers — no untrusted client can spoof them.
			TRUST_PROXY: "true",
		},
	});

	// Monitor for unexpected crashes
	const proc = appProcess;
	proc.exited.then((code) => {
		if (proc !== appProcess || intentionalKill) return;
		if (code === 0) return; // clean exit

		const now = Date.now();
		if (now - lastCrashTime < RAPID_CRASH_WINDOW) {
			crashCount++;
		} else {
			crashCount = 1;
		}
		lastCrashTime = now;

		if (crashCount >= MAX_RAPID_CRASHES) {
			console.error(
				`\n💥 App crashed ${crashCount} times in ${RAPID_CRASH_WINDOW / 1000}s — waiting for file change to restart\n`,
			);
			crashCount = 0;
			return;
		}

		console.warn(`\n⚠️  App crashed (exit code ${code}). Restarting...\n`);
		startAppServer();
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
		try {
			const reqUrl = new URL(req.url);
			const target = new URL(req.url);
			target.hostname = "localhost";
			target.port = String(APP_PORT);

			const forwardedHeaders = new Headers(req.headers);
			forwardedHeaders.set("x-forwarded-host", reqUrl.host);
			forwardedHeaders.set("x-forwarded-proto", reqUrl.protocol.replace(":", ""));

			return await fetch(
				new Request(target.toString(), {
					method: req.method,
					headers: forwardedHeaders,
					body: req.body,
					redirect: "manual",
				}),
			);
		} catch {
			return new Response("App server is starting...", {
				status: 503,
				headers: { "Content-Type": "text/plain", "Retry-After": "1" },
			});
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

const srcWatcher = watch(join(process.cwd(), "src"), { recursive: true }, (_event, filename) => {
	if (!filename) return;
	const abs = join(process.cwd(), "src", filename);
	if (isGenerated(abs)) return;
	console.log(`[watch] changed: ${filename}`);
	scheduleBuild();
});

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
