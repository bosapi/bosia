import type { PageServerLoad } from "./$types";

// Slow enough that the streamed shell (and its stylesheet links) is on the wire
// well before the markup — the window in which a FOUC used to be visible.
export const load = (async () => {
	await new Promise((r) => setTimeout(r, 600));
	return { loadedAt: new Date().toISOString() };
}) satisfies PageServerLoad;
