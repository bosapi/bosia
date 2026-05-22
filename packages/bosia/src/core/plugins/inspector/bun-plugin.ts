import { parse, compile } from "svelte/compiler";
import MagicString from "magic-string";
import { basename, relative } from "node:path";
import type { BunPlugin } from "bun";
import { svelteMapCache } from "../../svelteCompiler.ts";

const VIRTUAL_NS = "bosia-inspector-css";

type AnyNode = {
	type?: string;
	name?: string;
	start?: number;
	end?: number;
	[k: string]: unknown;
};

// Child-bearing keys across Svelte 5 modern AST nodes. Order doesn't matter.
const CHILD_KEYS = [
	"nodes", // Fragment
	"fragment", // RegularElement, KeyBlock, SvelteElement, SvelteComponent
	"consequent", // IfBlock (Fragment)
	"alternate", // IfBlock (Fragment | null)
	"body", // EachBlock, SnippetBlock (Fragment)
	"fallback", // EachBlock (Fragment | null)
	"pending", // AwaitBlock (Fragment | null)
	"then", // AwaitBlock (Fragment | null)
	"catch", // AwaitBlock (Fragment | null)
];

function walk(node: unknown, visit: (n: AnyNode) => void) {
	if (!node) return;
	if (Array.isArray(node)) {
		for (const c of node) walk(c, visit);
		return;
	}
	if (typeof node !== "object") return;
	const n = node as AnyNode;
	if (typeof n.type === "string") visit(n);
	for (const key of CHILD_KEYS) {
		const child = n[key];
		if (child) walk(child, visit);
	}
}

function lineColFromOffset(source: string, offset: number): { line: number; col: number } {
	let line = 1;
	let col = 1;
	for (let i = 0; i < offset && i < source.length; i++) {
		if (source[i] === "\n") {
			line++;
			col = 1;
		} else {
			col++;
		}
	}
	return { line, col };
}

function injectLocs(source: string, relPath: string): string {
	let ast: { fragment?: AnyNode };
	try {
		ast = parse(source, { modern: true }) as unknown as { fragment?: AnyNode };
	} catch {
		return source;
	}
	if (!ast.fragment) return source;

	const ms = new MagicString(source);
	const safeAttr = relPath.replace(/"/g, "&quot;");
	// HTML comment data cannot contain `--`; neutralise defensively. (Almost no
	// real path contains it, but a stray `--foo` directory shouldn't break parsing.)
	const safeComment = relPath.replace(/--/g, "__");
	walk(ast.fragment, (node) => {
		if (node.type === "RegularElement") {
			const name = node.name ?? "";
			if (!name) return;
			if (name === "script" || name === "style") return;
			if (/^[A-Z]/.test(name)) return;
			if (name.includes(":")) return;
			if (typeof node.start !== "number") return;
			const insertAt = node.start + 1 + name.length;
			const { line, col } = lineColFromOffset(source, node.start);
			ms.appendLeft(insertAt, ` data-bosia-loc="${safeAttr}:${line}:${col}"`);
			return;
		}
		// Bracket component invocations with HTML comments so the runtime can
		// walk DOM siblings to reconstruct the call-site chain (Page → Layout →
		// Button). Without this the per-element `data-bosia-loc` only points at
		// the component's *definition* file, which is misleading when the user
		// (or an AI agent) wants to edit the page that rendered it. Comments
		// survive into the rendered DOM because `preserveComments: dev` is set
		// on the compile call below.
		if (
			node.type === "Component" ||
			node.type === "SvelteComponent" ||
			node.type === "SvelteSelf"
		) {
			if (typeof node.start !== "number" || typeof node.end !== "number") return;
			const { line, col } = lineColFromOffset(source, node.start);
			ms.appendLeft(node.start, `<!--bosia:o=${safeComment}:${line}:${col}-->`);
			ms.appendRight(node.end, `<!--bosia:c-->`);
		}
	});
	return ms.toString();
}

export interface InspectorBunPluginOptions {
	cwd: string;
	target: "browser" | "bun";
	dev: boolean;
}

// Svelte 5 dev compile emits named `function get()` / `function set($$value)`
// expressions inside `$.bind_*` calls (for nicer `$inspect` stack traces). Bun's
// bundler destructures `import * as $ from "svelte/internal/client"` into named
// imports, so `$.get(search)` becomes plain `get(search)` — which collides with
// the wrapping function name and recurses into itself → RangeError. Prod compile
// uses anonymous arrow functions and is unaffected.
//
// Rename to `$$g` / `$$s` (3 chars — length-preserving so cached svelte source
// map columns stay accurate). These names aren't present in svelte/internal/client.
function fixBindShadow(code: string): string {
	return code
		.replace(/\bfunction get\(\)/g, () => "function $$g()")
		.replace(/\bfunction set\(\$\$value\)/g, () => "function $$s($$value)");
}

const fnv = (s: string): string => {
	let h = 2166136261;
	for (let i = 0; i < s.length; i++) {
		h ^= s.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return (h >>> 0).toString(36);
};

export function createInspectorBunPlugin(opts: InspectorBunPluginOptions): BunPlugin {
	const { cwd, target, dev } = opts;
	const generate: "client" | "server" = target === "browser" ? "client" : "server";
	const virtualCss = new Map<string, string>();

	return {
		name: "bosia-inspector",
		setup(build) {
			build.onLoad({ filter: /\.svelte$/ }, async (args) => {
				const source = await Bun.file(args.path).text();
				const rel = relative(cwd, args.path);
				const transformed = injectLocs(source, rel);

				const result = compile(transformed, {
					filename: args.path,
					generate,
					dev,
					hmr: dev,
					css: "external",
					preserveWhitespace: dev,
					preserveComments: dev,
					cssHash: ({ css }) => `svelte-${fnv(css)}`,
				});

				// Store Svelte's compile-step map. Bun's bundler doesn't chain
				// onLoad sourcemaps, so the final bundle map resolves stack frames
				// to the post-svelte-compile JS intermediate (`$.next()` /
				// `$.append()` calls) using the .svelte filename — line numbers
				// land past EOF. The inspector's runtime resolver chases bundle
				// map → this svelte map (with bias-interpolated lookup) to refine
				// to original source. `injectLocs` only shifts column offsets
				// inside HTML open tags, never script-block line numbers, so we
				// accept the small column drift to skip a second map chain.
				//
				// Only cache for the client target — server (Bun) and client builds
				// share `svelteMapCache` keyed by abs path, but their compile output
				// line numbers differ. The resolver translates browser-side stack
				// frames (delivered via SSE), which run client code.
				if (dev && generate === "client" && result.js.map) {
					const m =
						typeof result.js.map === "string"
							? JSON.parse(result.js.map)
							: result.js.map;
					svelteMapCache.set(args.path, m);
				}

				let js = dev ? fixBindShadow(result.js.code) : result.js.code;
				// Inject component <style> blocks via runtime JS, not CSS chunks.
				// Bun's `splitting: true` names CSS chunks after the importing JS
				// chunk's `[name]`, not the virtual module's uid — so when several
				// routes (e.g. multiple `+page.svelte`) transitively import the same
				// styled component, each route emits its own CSS sidecar named
				// `+page-<contentHash>.css`. Identical content → identical hash →
				// "Multiple files share the same output path". Runtime injection
				// avoids CSS chunking entirely.
				if (result.css?.code?.trim() && generate !== "server") {
					const safeBase = basename(args.path).replace(/\./g, "_");
					const uid = `${safeBase}-${fnv(args.path)}-style.css`;
					const virtualName = `${VIRTUAL_NS}:${uid}`;
					virtualCss.set(virtualName, result.css.code);
					js += `\nimport ${JSON.stringify(virtualName)};`;
				}

				return { contents: js, loader: "ts" };
			});

			build.onResolve({ filter: new RegExp(`^${VIRTUAL_NS}:`) }, (args) => ({
				path: args.path,
				namespace: VIRTUAL_NS,
			}));

			build.onLoad({ filter: /.*/, namespace: VIRTUAL_NS }, (args) => {
				const css = virtualCss.get(args.path) ?? "";
				virtualCss.delete(args.path);
				const contents = css
					? `(()=>{const s=document.createElement('style');s.textContent=${JSON.stringify(css)};document.head.appendChild(s);})();`
					: "";
				return { contents, loader: "js" };
			});
		},
	};
}
