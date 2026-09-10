import type { PageServerLoad } from "./$types";

// Slow on purpose, like the parent — this is what gives the inherited skeleton
// a window to be seen in.
export const load = (async () => {
	await new Promise((r) => setTimeout(r, 1500));
	return { loadedAt: new Date().toISOString() };
}) satisfies PageServerLoad;
