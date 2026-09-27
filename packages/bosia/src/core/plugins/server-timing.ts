import type { BosiaPlugin } from "../types/plugin.ts";

export interface ServerTimingOptions {
	/** Header name (defaults to standard `Server-Timing`). */
	header?: string;
	/** Metric name (defaults to `handler`). */
	metric?: string;
}

/**
 * Adds a `Server-Timing` response header that reports how long each request
 * spent inside the framework's handler. Measured from `onRequest` to
 * `onAfterHandle` — so for streaming SSR routes this is "time to start
 * streaming," not full end-to-end. Headers must flush before the body, so a
 * true end-to-end value cannot be reported in a response header.
 */
export function serverTiming(options: ServerTimingOptions = {}): BosiaPlugin {
	const headerName = options.header ?? "Server-Timing";
	const metric = options.metric ?? "handler";

	return {
		name: "server-timing",
		backend: {
			before(app) {
				const starts = new WeakMap<Request, number>();
				return app
					.onRequest(({ request }) => {
						starts.set(request, performance.now());
					})
					.onAfterHandle(({ request, response, set }) => {
						const start = starts.get(request);
						if (start === undefined) return;
						const dur = (performance.now() - start).toFixed(2);
						const value = `${metric};dur=${dur}`;

						// Set on Response objects directly when possible (preserves immutability semantics)
						if (response instanceof Response) {
							response.headers.set(headerName, value);
							return;
						}

						// Otherwise, push into the outbound header bag.
						const headers = (set.headers ??= {}) as Record<string, string>;
						headers[headerName] = value;
					});
			},
		},
	};
}

export default serverTiming;
