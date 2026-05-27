// ─── Bosia Plugin Types ──────────────────────────────────
// Public surface for first-party and third-party plugins.

import type { Elysia } from "elysia";
import type { BunPlugin } from "bun";
import type { RouteManifest } from "../types.ts";
import type { Metadata } from "../hooks.ts";

type MaybePromise<T> = T | Promise<T>;

export type BuildTarget = "browser" | "bun";

export interface BuildContext {
	mode: "production" | "development";
	cwd: string;
	manifest?: RouteManifest;
}

export interface DevContext {
	cwd: string;
}

export interface RenderContext {
	request: Request;
	url: URL;
	route: { pattern: string } | null;
	metadata: Metadata | null;
}

export interface BosiaPlugin {
	name: string;

	/**
	 * Mount points around the framework's HTTP backend. Currently typed as
	 * `Elysia` (the underlying backend), but the namespace is intentionally
	 * abstract so the API survives a future backend swap.
	 */
	backend?: {
		/** Runs before framework middleware/routes — can register routes that bypass Bosia. */
		before?: (app: Elysia) => MaybePromise<Elysia>;
		/** Runs after framework routes — receives the route manifest for introspection. */
		after?: (app: Elysia, ctx: { manifest: RouteManifest }) => MaybePromise<Elysia>;
	};

	/** Build pipeline hooks. */
	build?: {
		preBuild?: (ctx: BuildContext) => MaybePromise<void>;
		postScan?: (manifest: RouteManifest, ctx: BuildContext) => MaybePromise<void>;
		bunPlugins?: (target: BuildTarget) => BunPlugin[];
		postBuild?: (ctx: BuildContext) => MaybePromise<void>;
	};

	/** Dev pipeline hooks (wired in v0.5.0+). */
	dev?: {
		onStart?: (ctx: DevContext) => MaybePromise<void>;
		onFileChange?: (path: string) => MaybePromise<void>;
	};

	/** SSR render hooks — emitted strings are injected into the streaming HTML. */
	render?: {
		/** Injected before `</head>`, after framework metadata. */
		head?: (ctx: RenderContext) => MaybePromise<string>;
		/** Injected before `</body>`, after hydration script. */
		bodyEnd?: (ctx: RenderContext) => MaybePromise<string>;
	};

	/** Client lifecycle (wired in v0.5.0+). */
	client?: {
		onHydrate?: () => void;
		onNavigate?: (to: URL, from: URL) => void;
	};
}

/**
 * Compile-time audit of component imports in `.svelte` templates. When enabled
 * (the default), `<Card.Root>` style usages are validated against the
 * referenced module's actual exports so missing names fail the build instead
 * of crashing on first SSR render. `BOSIA_STRICT_IMPORTS=0` downgrades to
 * warnings at runtime.
 */
export type StrictImportsOption =
	| boolean
	| {
			/** Catch `<Mystery />` where `Mystery` has no binding. Default: true. */
			unbound?: boolean;
			/** Catch `<Card.Root>` where the namespace has no `Root` export. Default: true. */
			namespaceMember?: boolean;
			/** Promote selected `svelte/compiler` warnings to errors. Default: true. */
			warnings?: boolean;
	  };

export interface BosiaConfig {
	plugins?: (BosiaPlugin | false | null | undefined)[];
	strictImports?: StrictImportsOption;
}

/** Identity helper for type inference in `bosia.config.ts`. */
export function defineConfig(config: BosiaConfig): BosiaConfig {
	return config;
}
