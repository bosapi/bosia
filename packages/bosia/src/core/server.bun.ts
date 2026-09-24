// Bun entry — the default runtime. Loads user hooks off disk, builds the app,
// binds the port, and owns the process lifecycle (drain on SIGTERM/SIGINT,
// fatal handlers). Cloudflare Workers uses server.workers.ts instead.

import { existsSync } from "fs";
import { join } from "path";

import { beginShutdown, createApp, inFlightCount } from "./server.ts";
import type { Handle } from "./hooks.ts";
import { isDev } from "./html.ts";
import { OUT_DIR } from "./paths.ts";
import { pidsOnPort } from "./port.ts";
import { CACHE_ENABLED, CACHE_KEYS } from "./cache.ts";

// ─── User Hooks ──────────────────────────────────────────
// Production prefers the pre-bundled `${OUT_DIR}/hooks.server.js` emitted by the
// build (single-file, all relative imports inlined, npm deps left external) so
// production images can ship only `dist/` + `node_modules/` without the `src/`
// tree. Dev (and any environment lacking the artifact) falls back to importing
// `src/hooks.server.ts` directly so edits hot-reload without a build.

let handle: Handle | null = null;

const prebuiltHooksPath = join(process.cwd(), OUT_DIR, "hooks.server.js");
const srcHooksPath = join(process.cwd(), "src", "hooks.server.ts");
const hooksPath = existsSync(prebuiltHooksPath)
	? prebuiltHooksPath
	: existsSync(srcHooksPath)
		? srcHooksPath
		: null;
if (hooksPath) {
	try {
		const mod = await import(hooksPath);
		if (typeof mod.handle === "function") {
			handle = mod.handle as Handle;
			console.log(
				`🪝 Loaded ${hooksPath === prebuiltHooksPath ? "dist/hooks.server.js" : "src/hooks.server.ts"}`,
			);
		}
	} catch (err) {
		console.warn("⚠️  Failed to load hooks.server:", err);
	}
}

const app = await createApp({ handle });

// ─── Listen ──────────────────────────────────────────────

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : isDev ? 9001 : 9000;

try {
	app.listen(PORT, () => {
		// In dev mode the proxy owns the user-facing port — don't print the internal port
		if (!isDev) console.log(`⬡ Bosia server running at http://localhost:${PORT}`);
		// Last line of startup on purpose — the cache identity contract is the one
		// config mistake that leaks one user's page to another, so it stays visible.
		if (CACHE_ENABLED) {
			console.log(
				`\n🔑 Response cache tells users apart ONLY by these cookies/headers: [${CACHE_KEYS.join(", ")}]\n` +
					`   Using a different session cookie or auth header? Add its name to CACHE_KEYS,\n` +
					`   or one user's personalised page can be served to another. Routes personalised\n` +
					`   by anything else should set \`export const cache = false\`.\n` +
					`   Note: the runtime auto-warns only on uncovered *cookie* reads — it CANNOT\n` +
					`   detect header-based personalisation, so custom auth headers (X-Api-Key,\n` +
					`   X-Auth-Token, …) must be added to CACHE_KEYS by hand.\n`,
			);
		}
	});
} catch (err) {
	// Bun.serve runs inline inside .listen(), so a failed bind lands here.
	if ((err as { code?: string })?.code !== "EADDRINUSE") throw err;
	const [pid] = await pidsOnPort(PORT);
	console.error(
		`\n❌ Port ${PORT} is already serving${pid ? ` (pid ${pid})` : ""}.\n` +
			`   Stop it or set PORT to a free port.\n`,
	);
	process.exit(1);
}

// ─── Graceful Shutdown ───────────────────────────────────

let firstSignalAt = 0;

async function shutdown() {
	if (firstSignalAt) {
		// One ^C arrives multiple times (process group + `bun run` forwarding
		// to its child) — only a genuinely later signal is a second ^C.
		if (Date.now() - firstSignalAt > 200) process.exit(130); // second ^C = force quit
		return;
	}
	firstSignalAt = Date.now();
	const drained = beginShutdown();
	// Dev: nothing worth draining — exit instantly so ^C feels immediate.
	if (isDev) process.exit(0);
	console.log("⏳ Shutting down — draining in-flight requests...");

	await Promise.race([drained, Bun.sleep(10_000)]);

	const left = inFlightCount();
	if (left > 0) {
		console.warn(`⚠️  Force shutdown with ${left} request(s) still in flight`);
	} else {
		console.log("✅ All requests drained");
	}

	app.stop(true).then(() => process.exit(0));
	setTimeout(() => process.exit(1), 2_000);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

// Prod-only fatal handlers. The dev inspector plugin installs its own
// uncaughtException/unhandledRejection listeners that route errors into the
// overlay and let the dev runner's crash-backoff restart the process. In prod
// there's no inspector — without these handlers an unhandled rejection from a
// background timer or plugin hook orphans the process with no log context.
// Log + exit(1) lets the orchestrator (Podman/k8s) restart cleanly.
if (!isDev) {
	process.on("uncaughtException", (err: Error) => {
		console.error("[FATAL] uncaughtException:", err?.stack ?? err);
		process.exit(1);
	});
	process.on("unhandledRejection", (reason: unknown) => {
		const e = reason as Error | undefined;
		console.error("[FATAL] unhandledRejection:", e?.stack ?? reason);
		process.exit(1);
	});
}
