import { redirect, sequence } from "bosia";
import type { Handle } from "bosia";
import { db } from "./features/drizzle";
import { authHandle } from "./features/auth";

const dbHandle: Handle = async ({ event, resolve }) => {
	event.locals.db = db;
	return resolve(event);
};

// Every page under (private) needs a signed-in user. Checked here, by route id,
// before metadata() or any loader runs — on page loads, client navigations and forms.
const guardHandle: Handle = async ({ event, resolve }) => {
	if (event.route.id?.startsWith("/(private)") && !event.locals.user) {
		const next = encodeURIComponent(event.url.pathname + event.url.search);
		throw redirect(303, `/login?next=${next}`);
	}
	return resolve(event);
};

const loggingHandle: Handle = async ({ event, resolve }) => {
	const start = Date.now();
	event.locals.requestTime = start;
	const res = await resolve(event);
	const ms = Date.now() - start;
	console.log(`[${event.request.method}] ${event.url.pathname} ${res.status} (${ms}ms)`);
	res.headers.set("X-Response-Time", `${ms}ms`);
	return res;
};

export const handle = sequence(dbHandle, authHandle, guardHandle, loggingHandle);
