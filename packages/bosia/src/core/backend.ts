// ─── Bosia Backend App ────────────────────────────────────
// A tiny Elysia-shaped HTTP app: chainable routes + onRequest / onAfterHandle /
// onError hooks, one `fetch(request)` entry for Bun.serve and Workers alike.
// Only the subset the framework and plugins use — not a general router.

/** Outbound response bag — merged into whatever the handler returns. */
export interface ResponseSet {
	status?: number;
	headers: Record<string, string>;
}

export interface HandlerContext {
	request: Request;
	/**
	 * Parsed by content-type: JSON → object, form → object, else text. Only for
	 * exact-path routes — the framework's "*" catch-all reads the body itself.
	 */
	body: unknown;
	query: Record<string, string>;
	/** `request.url`, parsed once for the whole dispatch. */
	url: URL;
	set: ResponseSet;
}

export type Handler = (ctx: HandlerContext) => unknown;

export type RequestHook = (ctx: { request: Request; set: ResponseSet }) => unknown;

export type AfterHandleHook = (ctx: {
	request: Request;
	response: unknown;
	set: ResponseSet;
}) => unknown;

export type ErrorHook = (ctx: { request: Request; error: unknown; set: ResponseSet }) => unknown;

export interface ServeOptions {
	maxRequestBodySize?: number;
	idleTimeout?: number;
	reusePort?: boolean;
}

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS" | "*";

interface Route {
	method: Method;
	path: string;
	handler: Handler;
}

const BODYLESS = new Set(["GET", "HEAD"]);

export class BosiaApp {
	private routes: Route[] = [];
	private requestHooks: RequestHook[] = [];
	private afterHooks: AfterHandleHook[] = [];
	private errorHooks: ErrorHook[] = [];
	private server: ReturnType<typeof Bun.serve> | null = null;

	constructor(private config: { serve?: ServeOptions } = {}) {}

	get(path: string, handler: Handler): this {
		return this.route("GET", path, handler);
	}
	post(path: string, handler: Handler): this {
		return this.route("POST", path, handler);
	}
	put(path: string, handler: Handler): this {
		return this.route("PUT", path, handler);
	}
	patch(path: string, handler: Handler): this {
		return this.route("PATCH", path, handler);
	}
	delete(path: string, handler: Handler): this {
		return this.route("DELETE", path, handler);
	}
	options(path: string, handler: Handler): this {
		return this.route("OPTIONS", path, handler);
	}
	/** Any method. */
	all(path: string, handler: Handler): this {
		return this.route("*", path, handler);
	}

	/** Runs first on every request. Returning a value short-circuits routing. */
	onRequest(hook: RequestHook): this {
		this.requestHooks.push(hook);
		return this;
	}

	/** Runs after the handler. Returning a value replaces the response. */
	onAfterHandle(hook: AfterHandleHook): this {
		this.afterHooks.push(hook);
		return this;
	}

	/** Runs in registration order; the first hook to return a value answers. */
	onError(hook: ErrorHook): this {
		this.errorHooks.push(hook);
		return this;
	}

	// Paths match exactly, or "*" matches everything. Enough for plugin endpoints
	// like /__bosia/locate; add `:param` matching here when a plugin needs it.
	private route(method: Method, path: string, handler: Handler): this {
		this.routes.push({ method, path, handler });
		return this;
	}

	private match(method: string, pathname: string): Route | null {
		let wildcard: Route | null = null;
		for (const r of this.routes) {
			if (r.method !== "*" && r.method !== method) continue;
			// Exact paths beat "*" regardless of registration order, like Elysia.
			if (r.path === pathname) return r;
			if (r.path === "*" && !wildcard) wildcard = r;
		}
		return wildcard;
	}

	private allowed(pathname: string): string[] {
		const methods = new Set<string>();
		for (const r of this.routes) {
			if (r.path !== pathname && r.path !== "*") continue;
			if (r.method === "*") return [];
			methods.add(r.method);
		}
		if (methods.has("GET")) methods.add("HEAD");
		return [...methods];
	}

	fetch = async (request: Request): Promise<Response> => {
		const set: ResponseSet = { headers: {} };
		const isHead = request.method === "HEAD";
		const method = isHead ? "GET" : request.method.toUpperCase();
		try {
			const res = await this.dispatch(request, method, set);
			return isHead ? new Response(null, res) : res;
		} catch (error) {
			for (const hook of this.errorHooks) {
				const out = await hook({ request, error, set });
				if (out !== undefined) return toResponse(out, set);
			}
			return new Response("Internal Server Error", { status: 500 });
		}
	};

	private async dispatch(request: Request, method: string, set: ResponseSet): Promise<Response> {
		for (const hook of this.requestHooks) {
			const out = await hook({ request, set });
			if (out !== undefined) return toResponse(out, set);
		}

		const url = new URL(request.url);
		const route = this.match(method, url.pathname);
		let response: unknown;
		if (route) {
			let query: Record<string, string> | undefined;
			response = await route.handler({
				request,
				body: BODYLESS.has(method) || route.path === "*" ? undefined : await parseBody(request),
				// Built on first read: the framework's "*" route never reads it.
				get query() {
					return (query ??= Object.fromEntries(url.searchParams));
				},
				url,
				set,
			});
		} else {
			const allow = this.allowed(url.pathname);
			set.status = 405;
			if (allow.length > 0) set.headers["allow"] = allow.join(", ");
			response = "Method Not Allowed";
		}

		for (const hook of this.afterHooks) {
			const out = await hook({ request, response, set });
			if (out !== undefined) response = out;
		}
		return toResponse(response, set);
	}

	/** Bind on Bun. Throws synchronously on EADDRINUSE, like Bun.serve. */
	listen(port: number, callback?: () => void): this {
		const serve = this.config.serve ?? {};
		this.server = Bun.serve({
			port,
			fetch: this.fetch,
			maxRequestBodySize: serve.maxRequestBodySize,
			idleTimeout: serve.idleTimeout,
			reusePort: serve.reusePort ?? false,
		});
		callback?.();
		return this;
	}

	async stop(closeActiveConnections = false): Promise<void> {
		await this.server?.stop(closeActiveConnections);
		this.server = null;
	}
}

async function parseBody(request: Request): Promise<unknown> {
	const type = (request.headers.get("content-type") ?? "").toLowerCase();
	try {
		if (type.includes("application/json")) {
			const text = await request.clone().text();
			return text ? JSON.parse(text) : undefined;
		}
		if (
			type.includes("multipart/form-data") ||
			type.includes("application/x-www-form-urlencoded")
		) {
			return Object.fromEntries(await request.clone().formData());
		}
		const text = await request.clone().text();
		return text || undefined;
	} catch {
		return undefined;
	}
}

/** Handler return value → Response, with `set` status/headers merged in. */
function toResponse(value: unknown, set: ResponseSet): Response {
	const extra = Object.entries(set.headers);
	if (value instanceof Response) {
		if (extra.length === 0 && set.status === undefined) return value;
		// Rebuilt rather than mutated: a fetch() Response has immutable headers.
		const headers = new Headers(value.headers);
		for (const [k, v] of extra) headers.set(k, v);
		return new Response(value.body, {
			status: set.status ?? value.status,
			statusText: set.status === undefined ? value.statusText : undefined,
			headers,
		});
	}
	const status = set.status ?? 200;
	if (value === undefined || value === null) return new Response(null, { status, headers: extra });
	if (typeof value === "string") {
		const headers = new Headers(extra);
		if (!headers.has("content-type")) headers.set("content-type", "text/plain;charset=utf-8");
		return new Response(value, { status, headers });
	}
	return Response.json(value, { status, headers: extra });
}
