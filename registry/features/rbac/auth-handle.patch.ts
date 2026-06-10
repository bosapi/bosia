import type { Handle } from "bosia";
import { resolveSessionFromCookies } from "./session-resolver";
import { can } from "../rbac/can";

export const authHandle: Handle = async ({ event, resolve }) => {
	event.locals.user = await resolveSessionFromCookies(event.cookies);
	event.locals.can = (resource: string, action: string, scope?: string) =>
		can(event.locals.user?.id, resource, action, scope);
	return resolve(event);
};
