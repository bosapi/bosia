// ─── Bunia Hooks ─────────────────────────────────────────
// SvelteKit-compatible middleware API.
// Usage in src/hooks.server.ts:
//
//   import { sequence } from "bunia";
//   export const handle = sequence(authHandle, loggingHandle);

export type RequestEvent = {
    request: Request;
    url: URL;
    locals: Record<string, any>;
    params: Record<string, string>;
};

export type LoadEvent = {
    url: URL;
    params: Record<string, string>;
    locals: Record<string, any>;
    fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
    parent: () => Promise<Record<string, any>>;
};

export type ResolveFunction = (event: RequestEvent) => MaybePromise<Response>;

export type Handle = (input: {
    event: RequestEvent;
    resolve: ResolveFunction;
}) => MaybePromise<Response>;

type MaybePromise<T> = T | Promise<T>;

/**
 * Compose multiple `handle` functions into a single handler.
 * Each handler's `resolve` points to the next handler in the chain.
 */
export function sequence(...handlers: Handle[]): Handle {
    return ({ event, resolve }) => {
        function apply(i: number, e: RequestEvent): MaybePromise<Response> {
            if (i >= handlers.length) return resolve(e);
            return handlers[i]!({ event: e, resolve: (next) => apply(i + 1, next) });
        }
        return apply(0, event);
    };
}
