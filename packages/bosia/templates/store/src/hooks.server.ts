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

// Need an access log? Let nginx/Caddy keep it, or add `accessLog()` from
// "bosia/plugins/access-log" to bosia.config.ts.
export const handle = sequence(dbHandle, authHandle, guardHandle);
