// Post-login redirect target. `next` comes from the query string, so it's
// attacker-controllable — only allow same-site absolute paths, never external
// or protocol-relative ("//evil.com") URLs. Anything else falls back.

export function safeNext(next: string | null | undefined, fallback = "/dashboard"): string {
	if (next && next.startsWith("/") && !next.startsWith("//")) return next;
	return fallback;
}

// self-check — security path (redirect target), earns one runnable check.
if (import.meta.main) {
	const eq = (a: string, b: string) => {
		if (a !== b) throw new Error(`expected ${b}, got ${a}`);
	};
	eq(safeNext("/settings"), "/settings");
	eq(safeNext(null), "/dashboard");
	eq(safeNext(""), "/dashboard");
	eq(safeNext("//evil.com"), "/dashboard");
	eq(safeNext("https://evil.com"), "/dashboard");
	eq(safeNext("evil.com"), "/dashboard");
	console.log("safeNext ok");
}
