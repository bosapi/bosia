import { spawn, type Subprocess } from "bun";
import { watch } from "fs";
import { join } from "path";

console.log("🐰 Bunia dev server starting...\n");

// ─── State ────────────────────────────────────────────────

let appProcess: Subprocess | null = null;
let sseClients = new Set<ReadableStreamDefaultController>();

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
const BUNIA_NODE_MODULES = join(import.meta.dir, "..", "..", "node_modules");

async function runBuild(): Promise<boolean> {
    console.log("🏗️  Building...");
    const proc = spawn(["bun", "run", BUILD_SCRIPT], {
        stdout: "inherit",
        stderr: "inherit",
        cwd: process.cwd(),
    });
    return (await proc.exited) === 0;
}

// ─── App Server ───────────────────────────────────────────

const APP_PORT = 3001;

async function startAppServer() {
    if (appProcess) {
        appProcess.kill();
        await appProcess.exited;
    }

    // Read the server entry filename from the manifest written by build.ts
    let serverEntry = "index.js";
    try {
        const manifest = await Bun.file("./dist/manifest.json").json();
        serverEntry = manifest.serverEntry ?? "index.js";
    } catch { }

    appProcess = spawn(["bun", "run", `dist/server/${serverEntry}`], {
        stdout: "inherit",
        stderr: "inherit",
        cwd: process.cwd(),
        env: {
            ...process.env,
            NODE_ENV: "development",
            // Allow externalized deps (elysia, etc.) to resolve from bunia's node_modules
            NODE_PATH: BUNIA_NODE_MODULES,
        },
    });
}

// ─── Build & Restart ──────────────────────────────────────

let buildTimer: ReturnType<typeof setTimeout> | null = null;

async function buildAndRestart() {
    const ok = await runBuild();
    if (!ok) {
        console.error("❌ Build failed — fix errors and save again");
        return;
    }
    await startAppServer();
    // Give the app server a moment to bind its port
    await Bun.sleep(200);
    broadcastReload();
}

function scheduleBuild() {
    if (buildTimer) clearTimeout(buildTimer);
    buildTimer = setTimeout(buildAndRestart, 300);
}

// ─── Dev Proxy (Port 3000) ────────────────────────────────
// Owns the SSE connection so it survives app server restarts.
// All other requests are proxied to the app server.

const DEV_PORT = 3000;

Bun.serve({
    port: DEV_PORT,
    idleTimeout: 255,
    async fetch(req) {
        const url = new URL(req.url);

        // SSE endpoint — owned by dev server, not the app
        if (url.pathname === "/__bunia/sse") {
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

        // Proxy everything else to the app server
        try {
            const target = new URL(req.url);
            target.hostname = "localhost";
            target.port = String(APP_PORT);

            return await fetch(new Request(target.toString(), {
                method: req.method,
                headers: req.headers,
                body: req.body,
                redirect: "manual",
            }));
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

const GENERATED = [
    join(process.cwd(), ".bunia"),
    join(process.cwd(), "public", "bunia-tw.css"),
];

function isGenerated(path: string): boolean {
    return GENERATED.some(g => path.startsWith(g));
}

watch(
    join(process.cwd(), "src"),
    { recursive: true },
    (_event, filename) => {
        if (!filename) return;
        const abs = join(process.cwd(), "src", filename);
        if (isGenerated(abs)) return;
        console.log(`[watch] changed: ${filename}`);
        scheduleBuild();
    },
);

console.log("👀 Watching src/ for changes...\n");
