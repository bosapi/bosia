import type { LoadEvent } from "bosia";

// Sign-in is checked in hooks.server.ts, before this loader runs.
export async function load({ locals }: LoadEvent) {
	return { user: locals.user };
}
