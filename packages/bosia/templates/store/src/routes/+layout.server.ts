import type { LoadEvent } from "bosia";

export async function load({ locals }: LoadEvent) {
	return {
		appName: "Bosia Shop",
		requestTime: (locals.requestTime as number | null) ?? null,
		user: locals.user ?? null,
	};
}
