import type { Handle } from "bosia";

// Sets locals that every loader and API handler can read
const authHandle: Handle = async ({ event, resolve }) => {
	event.locals.requestTime = Date.now();
	event.locals.user = null; // replace with real session logic
	return resolve(event);
};

// Need an access log? Let nginx/Caddy keep it, or add `accessLog()` from
// "bosia/plugins/access-log" to bosia.config.ts.
export const handle = authHandle;
