import type { BosiaPlugin } from "../types/plugin.ts";

export interface AccessLogEntry {
	method: string;
	/** Path without the query string. */
	path: string;
	/** The status the client got. */
	status: number;
	/** Time to build the response, in milliseconds (not to deliver its body). */
	ms: number;
	request: Request;
}

export interface AccessLogOptions {
	/** Return false to skip a line, e.g. `(e) => e.status >= 400 || e.ms > 200`. */
	filter?: (entry: AccessLogEntry) => boolean;
	/** One line per request, without the trailing newline. */
	format?: (entry: AccessLogEntry) => string;
	/** Where lines go. Defaults to console.log, one call per batch. May be async;
	 *  a failed write loses that batch, never the request or the process. */
	write?: (chunk: string) => void | Promise<unknown>;
	/**
	 * Lines are collected and written together at most this often (ms). One
	 * write per request costs a syscall each: on a pipe (`docker logs`, systemd)
	 * that was ~11–14µs of CPU per request, batched ~3µs. 0 writes every line at
	 * once. Defaults to 100 on Bun, 0 on Workers (no timers after a response).
	 */
	flushMs?: number;
}

/** Flush early once this much is waiting, so a burst never piles up here. */
const MAX_BUFFER_CHARS = 64 * 1024;

function defaultFormat(e: AccessLogEntry): string {
	return `[${e.method}] ${e.path} ${e.status} (${e.ms.toFixed(1)}ms)`;
}

/**
 * One console.log per batch. On Bun it blocks until the pipe takes every byte;
 * `process.stdout.write` queued on a slow pipe and lost the queue at exit, and
 * `fs.writeSync(1)` wrote part of a batch (non-blocking stdout) and dropped the
 * rest — ~870 of 3000 lines in a test, both ways. Like any console.log, a log
 * reader that stops reading slows the server.
 */
function defaultWrite(chunk: string): void {
	console.log(chunk.endsWith("\n") ? chunk.slice(0, -1) : chunk);
}

/** Path of a request URL without allocating a URL object. */
function pathOf(url: string): string {
	const start = url.indexOf("/", url.indexOf("//") + 2);
	if (start === -1) return "/";
	const q = url.indexOf("?", start);
	return q === -1 ? url.slice(start) : url.slice(start, q);
}

/**
 * Logs one line per request: method, path, status, duration. Opt-in — the
 * app templates no longer log every request from `hooks.server.ts`; a reverse
 * proxy (nginx, Caddy) can keep the access log instead.
 *
 * Reads the final response (`onResponse`), so the status is what the client
 * got whatever other plugins did, and every request is logged exactly once.
 */
export function accessLog(options: AccessLogOptions = {}): BosiaPlugin {
	const format = options.format ?? defaultFormat;
	const write = options.write ?? defaultWrite;
	// Workers drops timers once the response is sent: a batch would never flush.
	const flushMs = typeof Bun === "undefined" ? 0 : (options.flushMs ?? 100);
	const filter = options.filter;

	let buffer = "";
	let timer: ReturnType<typeof setTimeout> | null = null;
	const flush = () => {
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
		if (buffer === "") return;
		const out = buffer;
		buffer = "";
		try {
			const done = write(out);
			if (done instanceof Promise) done.catch(() => {});
		} catch {
			// A broken sink loses this batch, not the request or the process.
		}
	};
	let exitHooked = false;

	const log = (entry: AccessLogEntry) => {
		if (filter && !filter(entry)) return;
		buffer += format(entry) + "\n";
		if (flushMs <= 0 || buffer.length >= MAX_BUFFER_CHARS) flush();
		else if (!timer) {
			// Lines still waiting when the server drains and exits. Added on the
			// first buffered line, so `bosia build` (which loads the config too)
			// never registers one.
			if (!exitHooked && typeof process !== "undefined" && typeof process.once === "function") {
				exitHooked = true;
				process.once("exit", flush);
			}
			timer = setTimeout(flush, flushMs);
			(timer as { unref?: () => void }).unref?.();
		}
	};

	return {
		name: "access-log",
		backend: {
			before(app) {
				// onResponse swallows a throw here (a broken filter/format/sink),
				// so logging can never change or fail a response.
				return app.onResponse(({ request, status, start }) => {
					log({
						method: request.method,
						path: pathOf(request.url),
						status,
						ms: performance.now() - start,
						request,
					});
				});
			},
		},
	};
}

export default accessLog;
