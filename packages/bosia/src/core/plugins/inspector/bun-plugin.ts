import { parse, compile } from "svelte/compiler";
import MagicString from "magic-string";
import { basename, relative } from "node:path";
import type { BunPlugin } from "bun";

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
	walk(ast.fragment, (node) => {
		if (node.type !== "RegularElement") return;
		const name = node.name ?? "";
		if (!name) return;
		if (name === "script" || name === "style") return;
		if (/^[A-Z]/.test(name)) return;
		if (name.includes(":")) return;
		if (typeof node.start !== "number") return;
		const insertAt = node.start + 1 + name.length;
		const { line, col } = lineColFromOffset(source, node.start);
		const safe = relPath.replace(/"/g, "&quot;");
		ms.appendLeft(insertAt, ` data-bosia-loc="${safe}:${line}:${col}"`);
	});
	return ms.toString();
}

export interface InspectorBunPluginOptions {
	cwd: string;
	target: "browser" | "bun";
	dev: boolean;
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

				let js = result.js.code;
				// Skip empty CSS — multiple +page.svelte routes with no <style> would
				// otherwise each emit an empty CSS chunk, all hashing to the same
				// content → Bun fails with "Multiple files share the same output path".
				// Also strip dots from basename: Bun's `[name]-[hash].[ext]` chunk
				// naming treats the first `.` as the extension boundary, so
				// `+page.svelte-…` collapses to `[name]="+page"` for every route.
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
				return { contents: css, loader: "css" };
			});
		},
	};
}
