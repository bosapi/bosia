import type { LoadEvent } from "bosia";

// Cloudflare bindings reach loaders as `platform.env`. GREETING is a plain
// var from wrangler.jsonc; D1, KV and R2 bindings arrive the same way.
export function load({ platform }: LoadEvent) {
	return {
		onWorkers: platform !== undefined,
		greeting: platform?.env.GREETING ?? null,
	};
}
