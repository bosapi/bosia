import type { LoadEvent } from "bosia";

// Repro for the uncovered-cookie cache warning: reads a cookie that is NOT
// in CACHE_KEYS. Request this page with `Cookie: my_app_sess=abc` and the
// server logs the 🚨 SECURITY WARNING when the response is cached.
export async function load({ cookies }: LoadEvent) {
	return {
		sess: cookies.get("my_app_sess") ?? "(no my_app_sess cookie sent)",
	};
}
