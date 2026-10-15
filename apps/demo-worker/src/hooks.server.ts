import { sequence, redirect } from "bosia";
import type { Handle } from "bosia";

// Sets locals that every loader and API handler can read
const authHandle: Handle = async ({ event, resolve }) => {
	event.locals.requestTime = Date.now();
	event.locals.user = null; // replace with real session logic
	return resolve(event);
};

// Route protection. `event.url` is the page the visitor asked for whether the
// browser loaded it or the client router fetched its data, so one check covers
// both — see /guard-test.
const guardHandle: Handle = async ({ event, resolve }) => {
	if (event.url.pathname.startsWith("/guard-test/panel") && !event.locals.user) {
		throw redirect(303, "/guard-test/login");
	}
	return resolve(event);
};

// The access log comes from the accessLog() plugin in bosia.config.ts.
export const handle = sequence(authHandle, guardHandle);
