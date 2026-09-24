import type { LoadEvent } from "bosia";

export const ssr = false;

export async function load(_event: LoadEvent) {
	return {
		hello: "world",
		loadedAt: new Date().toISOString(),
	};
}
