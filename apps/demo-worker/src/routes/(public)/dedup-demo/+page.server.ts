import type { PageServerLoad } from "./$types";
import { slowQuery } from "$lib/dedupCounter";

export const load = (async () => {
	const result = await slowQuery("dedup-demo");
	console.log(`[dedup-demo] loader run #${result.count} @ ${result.loadedAt}`);
	return result;
}) satisfies PageServerLoad;
