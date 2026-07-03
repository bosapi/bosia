// Virtual modules resolved by the bundler plugin (src/core/plugin.ts).
// Backed by .bosia/routes.ts and .bosia/routes.client.ts at build time.

declare module "bosia:routes" {
	type Loader = () => Promise<any>;
	type TrailingSlash = "never" | "always" | "ignore";

	export const clientRoutes: Array<{
		pattern: string;
		page: Loader;
		layouts: Loader[];
		hasServerData: boolean;
		trailingSlash: TrailingSlash;
	}>;

	export const serverRoutes: Array<{
		pattern: string;
		pageModule: Loader;
		layoutModules: Loader[];
		pageServer: Loader | null;
		layoutServers: { loader: Loader; depth: number }[];
		trailingSlash: TrailingSlash;
	}>;

	export const apiRoutes: Array<{
		pattern: string;
		module: Loader;
	}>;

	export const errorPage: Loader | null;
}
