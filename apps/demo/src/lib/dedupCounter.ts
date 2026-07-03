// Module-level counters demonstrate identity-aware dedup: concurrent loads
// with the SAME identity (CACHE_KEYS cookie/header) share one loader run;
// different identities run separately.
const counters: Record<string, number> = {};

export async function slowQuery(key: string): Promise<{ count: number; loadedAt: string }> {
	counters[key] = (counters[key] ?? 0) + 1;
	const count = counters[key];
	const loadedAt = new Date().toISOString();
	// Simulate a slow DB hit so concurrent requests overlap in flight
	await new Promise((r) => setTimeout(r, 300));
	return { count, loadedAt };
}
