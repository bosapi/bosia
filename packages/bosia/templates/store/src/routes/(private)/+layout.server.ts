import { redirect } from "bosia";
import type { LoadEvent } from "bosia";

export async function load({ locals, url }: LoadEvent) {
	if (!locals.user) {
		const next = encodeURIComponent(url.pathname + url.search);
		throw redirect(303, `/login?next=${next}`);
	}
	return { user: locals.user };
}
