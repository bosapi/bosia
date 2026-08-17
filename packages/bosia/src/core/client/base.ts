import { normalizeBase } from "../basePath.ts";

/**
 * The prefix this app is mounted under, handed over by the inline script
 * `buildHtml` emits. `""` for a root-mounted app.
 *
 * The navigation path does not use this. `clientRoutes` are generated with the
 * prefix already in them, so an anchor's href, the address bar and the route
 * table are all the same strings — a click pushes exactly the URL that was in
 * the link, and nothing rewrites a path after the user acts on it.
 *
 * It is needed only to build the `/__bosia/data` endpoint URL, where the mount
 * prefix sits in front of the endpoint rather than in front of the route.
 */
export const base: string = normalizeBase(
	typeof window !== "undefined"
		? (window as unknown as { __BOSIA_BASE__?: string }).__BOSIA_BASE__
		: "",
);
