// The sentinel. If this string reaches an unauthenticated caller — in the HTML
// or in the /__bosia/data payload — the guard did not run.
export function load() {
	return { secret: "rahasia" };
}
