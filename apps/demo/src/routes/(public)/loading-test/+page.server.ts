import type { PageServerLoad } from "./$types";

// Deliberately slow so the +loading.svelte skeleton is visible during nav.
export const load = (async () => {
	await new Promise((r) => setTimeout(r, 1500));
	return { loadedAt: new Date().toISOString() };
}) satisfies PageServerLoad;
