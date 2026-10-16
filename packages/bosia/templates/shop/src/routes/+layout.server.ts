import type { LoadEvent } from "bosia";

export async function load({ locals }: LoadEvent) {
	return {
		appName: "Bosia Shop",
		user: locals.user ?? null,
	};
}
