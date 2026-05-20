// ─── Navigation lifecycle registry ────────────────────────
// Shared listener storage for `beforeNavigate` / `afterNavigate`. Kept in a
// dedicated module so `router.svelte.ts` can fire events without importing
// `navigation.ts` (which transitively imports the router — would deadlock
// the ESM evaluation cycle).

export interface NavigationTarget {
	url: URL;
	params: Record<string, string>;
}

export interface Navigation {
	from: NavigationTarget | null;
	to: NavigationTarget | null;
	type: "link" | "goto" | "popstate" | "form" | "enter";
	willUnload: boolean;
	cancel: () => void;
}

export type BeforeNavigateCallback = (nav: Navigation) => void | Promise<void>;
export type AfterNavigateCallback = (nav: Navigation) => void;

export const beforeListeners = new Set<BeforeNavigateCallback>();
export const afterListeners = new Set<AfterNavigateCallback>();

/** Returns true when navigation should proceed, false when a listener cancelled it. */
export function fireBeforeNavigate(nav: Navigation): boolean {
	let cancelled = false;
	nav.cancel = () => {
		cancelled = true;
	};
	for (const fn of beforeListeners) {
		try {
			fn(nav);
		} catch (err) {
			console.warn("[bosia] beforeNavigate listener threw", err);
		}
		if (cancelled) return false;
	}
	return true;
}

export function fireAfterNavigate(nav: Navigation): void {
	for (const fn of afterListeners) {
		try {
			fn(nav);
		} catch (err) {
			console.warn("[bosia] afterNavigate listener threw", err);
		}
	}
}
