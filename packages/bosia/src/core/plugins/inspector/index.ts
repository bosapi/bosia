import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import type { Elysia } from "elysia";
import { createInspectorBunPlugin } from "./bun-plugin.ts";
import { getOverlayScript } from "./overlay.ts";
import { resolveFrame, resolveStack } from "./sourcemap.ts";
import type { BosiaPlugin } from "../../types/plugin.ts";

export interface InspectorOptions {
	/** Editor CLI command. Defaults to `code`. */
	editor?: "code" | "cursor" | "zed" | (string & {});
	/** When set, alt+click opens a comment form whose contents POST here. */
	aiEndpoint?: string;
	/** Endpoint path the overlay POSTs to. Defaults to `/__bosia/locate`. */
	endpoint?: string;
	/** Capture client + server runtime errors and surface them in the overlay. Default `true`. */
	errorsEnabled?: boolean;
}

interface ServerError {
	id: string;
	ts: number;
	source: "server" | "uncaught" | "rejection";
	message: string;
	stack?: string;
	file?: string;
	line?: number;
	col?: number;
}

const RUNTIME_ERROR_PREFIX = "[runtime error]";

function buildEditorArgs(editor: string, file: string, line: number, col: number): string[] {
	if (editor === "zed") return [`${file}:${line}:${col}`];
	return ["-g", `${file}:${line}:${col}`];
}

// Parse the top frame out of a stack trace string. Best-effort.
function parseTopFrame(
	stack: string | undefined,
): { file: string; line: number; col: number } | null {
	if (!stack) return null;
	const m =
		/\((https?:\/\/[^)]+|\/[^)]+):(\d+):(\d+)\)/.exec(stack) ||
		/at\s+(\S+):(\d+):(\d+)/.exec(stack) ||
		/@(\S+):(\d+):(\d+)/.exec(stack);
	return m ? { file: m[1], line: Number(m[2]), col: Number(m[3]) } : null;
}

// Module-scoped state for the error feature. Initialised lazily inside the
// plugin so importing this module doesn't attach process-wide listeners.
let processListenersInstalled = false;
const sseClients = new Set<ReadableStreamDefaultController<Uint8Array>>();
const dedupMap = new Map<string, { lastTs: number }>();
const DEDUP_WINDOW_MS = 500;
// Small bounded replay buffer — errors that fire during a failing render
// happen *before* the 500 page's overlay can connect to SSE. On connect we
// flush recent errors so the badge isn't empty.
const REPLAY_LIMIT = 50;
const REPLAY_TTL_MS = 30_000;
const replayBuffer: ServerError[] = [];

function encode(line: string): Uint8Array {
	return new TextEncoder().encode(line);
}

function broadcastError(err: ServerError) {
	const payload = encode(`event: bosia-error\ndata: ${JSON.stringify(err)}\n\n`);
	for (const ctrl of sseClients) {
		try {
			ctrl.enqueue(payload);
		} catch {
			sseClients.delete(ctrl);
		}
	}
}

function pushServerError(input: Omit<ServerError, "id" | "ts">) {
	const firstFrame = input.stack ? (input.stack.split("\n").find((l) => l.trim()) ?? "") : "";
	const key = `${input.source}:${input.message}:${firstFrame}`;
	const now = Date.now();
	const prev = dedupMap.get(key);
	if (prev && now - prev.lastTs < DEDUP_WINDOW_MS) {
		prev.lastTs = now;
		return;
	}
	dedupMap.set(key, { lastTs: now });

	const top = parseTopFrame(input.stack);
	const err: ServerError = {
		id: randomUUID(),
		ts: now,
		source: input.source,
		message: input.message,
		stack: input.stack,
		file: input.file ?? top?.file,
		line: input.line ?? top?.line,
		col: input.col ?? top?.col,
	};
	replayBuffer.push(err);
	if (replayBuffer.length > REPLAY_LIMIT) replayBuffer.shift();
	broadcastError(err);
}

function flushReplay(ctrl: ReadableStreamDefaultController<Uint8Array>) {
	const cutoff = Date.now() - REPLAY_TTL_MS;
	for (const err of replayBuffer) {
		if (err.ts < cutoff) continue;
		try {
			ctrl.enqueue(encode(`event: bosia-error\ndata: ${JSON.stringify(err)}\n\n`));
		} catch {
			return;
		}
	}
}

function installProcessListeners() {
	if (processListenersInstalled) return;
	processListenersInstalled = true;

	process.on("uncaughtException", (err: Error) => {
		pushServerError({
			source: "uncaught",
			message: err?.message ?? String(err),
			stack: err?.stack,
		});
		// Rethrow so the dev runner's existing crash-recovery still triggers.
		throw err;
	});

	process.on("unhandledRejection", (reason: unknown) => {
		const e = reason as Error | undefined;
		pushServerError({
			source: "rejection",
			message: e?.message ?? String(reason),
			stack: e?.stack,
		});
	});
}

// Expose the push function via globalThis so framework catch sites — which
// live in a separately-bundled module graph from this disk-loaded plugin —
// can notify the inspector without an import dependency. Renderer catches
// (page load, layout load, SSR load) swallow errors and return a rendered
// error page, so they never reach Elysia `.onError()` on their own. The
// global is typed in core/devErrorReport.ts.
function installGlobalReporter() {
	globalThis.__BOSIA_REPORT_ERROR__ = (e) => {
		pushServerError({
			source: e.source ?? "server",
			message: e.message,
			stack: e.stack,
		});
	};
}

/**
 * Inspector plugin — alt+click an element in the running dev page to jump
 * to its source in your editor, or open a comment form that hands off to an
 * AI agent. Dev-only: production builds inject nothing and mount no endpoint.
 */
export function inspector(options: InspectorOptions = {}): BosiaPlugin | false {
	if (process.env.NODE_ENV === "production") return false;
	const editor = options.editor ?? "code";
	const endpoint = options.endpoint ?? "/__bosia/locate";
	// Env override lets hosts (e.g. bosapi running the app inside a podman
	// container) point inspector POSTs at an address reachable from inside
	// the sandbox, since the URL baked into bosia.config.ts resolves to the
	// container's own loopback there.
	const aiEndpoint = process.env.BOSIA_INSPECTOR_AI_ENDPOINT?.trim() || options.aiEndpoint;
	const errorsEnabled = options.errorsEnabled !== false;

	return {
		name: "inspector",

		build: {
			bunPlugins: (target) => [createInspectorBunPlugin({ cwd: process.cwd(), target, dev: true })],
		},

		backend: {
			before(app) {
				// Cast to the base Elysia type — chaining .post/.get/.onError narrows
				// the generic so the plugin return type drifts unless we widen back.
				let chained: Elysia = app as unknown as Elysia;
				chained = chained.post(endpoint, async ({ body }: { body: unknown }) => {
					const data = (body ?? {}) as {
						file?: string;
						line?: number;
						col?: number;
						comment?: string;
					};
					const file = typeof data.file === "string" ? data.file : null;
					const line = Number.isFinite(data.line) ? Number(data.line) : null;
					const col = Number.isFinite(data.col) ? Number(data.col) : 1;
					if (!file || line === null) {
						return new Response(JSON.stringify({ ok: false, error: "missing file/line" }), {
							status: 400,
							headers: { "content-type": "application/json" },
						});
					}

					const comment = typeof data.comment === "string" ? data.comment.trim() : "";
					if (comment && aiEndpoint) {
						// Runtime-error comments arrive with compiled stack frames. Resolve
						// them lazily here so the AI receives source paths it can actually
						// edit. Plain alt-click comments skip resolution.
						let finalFile = file;
						let finalLine = line;
						let finalCol = col;
						let finalComment = comment;
						if (comment.startsWith(RUNTIME_ERROR_PREFIX)) {
							const resolved = resolveFrame(file, line, col);
							if (resolved) {
								finalFile = resolved.file;
								finalLine = resolved.line;
								finalCol = resolved.col;
							}
							finalComment = resolveStack(comment);
						}
						try {
							let origin: string;
							try {
								origin = new URL(aiEndpoint).origin;
							} catch {
								origin = "http://localhost";
							}
							await fetch(aiEndpoint, {
								method: "POST",
								headers: {
									"content-type": "application/json",
									origin,
								},
								body: JSON.stringify({
									file: finalFile,
									line: finalLine,
									col: finalCol,
									comment: finalComment,
								}),
							});
							return { ok: true, mode: "ai" as const };
						} catch (err) {
							console.error("[inspector] aiEndpoint POST failed:", err);
							return new Response(JSON.stringify({ ok: false, error: "ai endpoint failed" }), {
								status: 502,
								headers: { "content-type": "application/json" },
							});
						}
					}

					try {
						const proc = spawn(editor, buildEditorArgs(editor, file, line, col), {
							detached: true,
							stdio: "ignore",
						});
						proc.unref();
						proc.on("error", (err) => {
							console.error(`[inspector] failed to launch "${editor}":`, err);
						});
					} catch (err) {
						console.error(`[inspector] failed to launch "${editor}":`, err);
						return new Response(JSON.stringify({ ok: false, error: "editor launch failed" }), {
							status: 500,
							headers: { "content-type": "application/json" },
						});
					}
					return { ok: true, mode: "editor" as const };
				});

				if (errorsEnabled) {
					installProcessListeners();
					installGlobalReporter();

					// Elysia onError — runs because server.ts registers plugin
					// backend.before() ahead of the base .onError() responder.
					chained = chained.onError(({ error }) => {
						const e = error as Error;
						pushServerError({
							source: "server",
							message: e?.message ?? String(error),
							stack: e?.stack,
						});
						// Fall through to the base handler.
						return undefined;
					}) as unknown as Elysia;

					// Live SSE stream. New clients also get a flush of the bounded
					// replay buffer so errors that fired during a failing render
					// (before the 500 page's overlay could subscribe) are visible.
					chained = chained.get("/__bosia/errors", ({ request }: { request: Request }) => {
						const stream = new ReadableStream<Uint8Array>({
							start(ctrl) {
								sseClients.add(ctrl);
								try {
									ctrl.enqueue(encode(":ok\n\n"));
								} catch {
									sseClients.delete(ctrl);
									return;
								}
								flushReplay(ctrl);
								const ping = setInterval(() => {
									try {
										ctrl.enqueue(encode(":ping\n\n"));
									} catch {
										clearInterval(ping);
										sseClients.delete(ctrl);
									}
								}, 25_000);

								request.signal.addEventListener("abort", () => {
									clearInterval(ping);
									sseClients.delete(ctrl);
									try {
										ctrl.close();
									} catch {}
								});
							},
						});
						return new Response(stream, {
							headers: {
								"Content-Type": "text/event-stream; charset=utf-8",
								"Cache-Control": "no-cache",
								Connection: "keep-alive",
							},
						});
					}) as unknown as Elysia;
				}

				return chained;
			},
		},

		render: {
			bodyEnd: () => getOverlayScript({ aiEndpoint, endpoint, errorsEnabled }),
		},
	};
}

export default inspector;
