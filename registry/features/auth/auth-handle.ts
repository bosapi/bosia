import type { Handle } from "bosia";
import { resolveSessionFromCookies } from "./session-resolver";

export const authHandle: Handle = async ({ event, resolve }) => {
	event.locals.user = await resolveSessionFromCookies(event.cookies);
	return resolve(event);
};
