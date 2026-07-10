import type { PageServerLoad } from "./$types";

export const load = (async ({ setHeaders }) => {
	setHeaders({
		"cache-control": "public, max-age=60",
		"x-demo-header": "set-from-loader",
	});
	return { loadedAt: new Date().toISOString() };
}) satisfies PageServerLoad;
