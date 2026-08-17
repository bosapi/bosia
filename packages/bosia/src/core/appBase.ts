import { normalizeBase } from "./basePath.ts";

// The mounted base, resolved from whichever side of the wire is asking. Kept
// out of paths.ts because that module reaches for `fs`, and this one has to
// survive being pulled into a client bundle by `errors.ts`.
//
// Memoized on first use rather than at import: the CLI sets `BASE_PATH` after
// these modules are already loaded, and tests need to move it between cases.
let cached: string | null = null;

export function currentBase(): string {
	if (cached === null) {
		cached = normalizeBase(
			typeof window !== "undefined"
				? (window as unknown as { __BOSIA_BASE__?: string }).__BOSIA_BASE__
				: process.env.BASE_PATH,
		);
	}
	return cached;
}

/** Test seam — the base is memoized per process. */
export function resetBaseCache(): void {
	cached = null;
}
