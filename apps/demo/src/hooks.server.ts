import { sequence } from "bosbun";
import type { Handle } from "bosbun";

// Sets locals that every loader and API handler can read
const authHandle: Handle = async ({ event, resolve }) => {
    event.locals.requestTime = Date.now();
    event.locals.user = null; // replace with real session logic
    return resolve(event);
};

// Logs each request with method, path, status, and duration
const loggingHandle: Handle = async ({ event, resolve }) => {
    const start = Date.now();
    const res = await resolve(event);
    const ms = Date.now() - start;
    console.log(`[${event.request.method}] ${event.url.pathname} ${res.status} (${ms}ms)`);
    res.headers.set("X-Response-Time", `${ms}ms`);
    return res;
};

export const handle = sequence(authHandle, loggingHandle);
