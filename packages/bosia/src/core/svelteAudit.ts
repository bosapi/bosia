import { resolveImportPath } from "./resolveImport.ts";
import { lineColFromOffset } from "./sourceLoc.ts";
import type { StrictImportsOption } from "./types/plugin.ts";

// ─── Compile-time component-import audit ─────────────────
// `bosia build` used to silently produce bundles that crashed on first SSR
// render when a `.svelte` template did `<Card.Root>` while `card/index.ts`
// exported `Card`/`CardContent` (not `Root`). Bun's bundler + svelte/compiler
// validate JS, but neither cross-checks template component identifiers
// against their imported source — the failure only surfaces at runtime as
// `undefined is not a function`.
//
// This module walks the template fragment for `<Component>` / `<X.Y>` refs,
// extracts top-level bindings from `<script>` / `<script module>`, and reports
// unbound identifiers or missing namespace members as aggregated errors —
// thrown from `onLoad`, captured into the Bun build's `result.logs`.

type AnyNode = {
	type?: string;
	name?: string;
	start?: number;
	end?: number;
	[k: string]: unknown;
};

// Same set the inspector plugin walks — `key` deliberately omitted because
// KeyBlock uses `fragment`, which is already covered.
const CHILD_KEYS = [
	"nodes",
	"fragment",
	"consequent",
	"alternate",
	"body",
	"fallback",
	"pending",
	"then",
	"catch",
];

type BindingKind = "namespace-import" | "named-import" | "default-import" | "local";

interface Binding {
	name: string;
	kind: BindingKind;
	/** Source string from the `from` clause (only for `*-import` kinds). */
	source?: string;
}

interface AuditError {
	kind: "unbound-identifier" | "missing-namespace-export" | "dotted-on-non-namespace" | "warning";
	line: number;
	col: number;
	message: string;
}

export interface SvelteAuditOptions {
	source: string;
	filename: string;
	ast: unknown;
	warnings: Array<{
		code?: string;
		message?: string;
		start?: { line?: number; column?: number };
	}>;
	cwd: string;
	exportCache: Map<string, Set<string> | null>;
	strict: StrictImportsOption;
}

function resolveStrict(opt: StrictImportsOption): {
	unbound: boolean;
	namespaceMember: boolean;
	warnings: boolean;
} {
	if (opt === false) return { unbound: false, namespaceMember: false, warnings: false };
	if (opt === true || opt === undefined) {
		return { unbound: true, namespaceMember: true, warnings: true };
	}
	return {
		unbound: opt.unbound !== false,
		namespaceMember: opt.namespaceMember !== false,
		warnings: opt.warnings !== false,
	};
}

function walk(node: unknown, visit: (n: AnyNode, parent: AnyNode | null) => boolean | void) {
	const stack: Array<{ node: unknown; parent: AnyNode | null }> = [{ node, parent: null }];
	while (stack.length) {
		const { node: cur, parent } = stack.pop()!;
		if (!cur) continue;
		if (Array.isArray(cur)) {
			for (const c of cur) stack.push({ node: c, parent });
			continue;
		}
		if (typeof cur !== "object") continue;
		const n = cur as AnyNode;
		let descend = true;
		if (typeof n.type === "string") {
			const result = visit(n, parent);
			if (result === false) descend = false;
		}
		if (!descend) continue;
		for (const key of CHILD_KEYS) {
			const child = n[key];
			if (child) stack.push({ node: child, parent: n });
		}
	}
}

function extractBindings(ast: AnyNode): Binding[] {
	const out: Binding[] = [];
	const collectFromScript = (script: AnyNode | undefined | null) => {
		if (!script || typeof script !== "object") return;
		const content = script.content as AnyNode | undefined;
		if (!content) return;
		const body = content.body;
		if (!Array.isArray(body)) return;
		for (const stmt of body as AnyNode[]) {
			if (!stmt || typeof stmt !== "object") continue;
			switch (stmt.type) {
				case "ImportDeclaration": {
					const sourceNode = stmt.source as AnyNode | undefined;
					const source =
						sourceNode && typeof sourceNode.value === "string"
							? (sourceNode.value as string)
							: "";
					const specs = stmt.specifiers as AnyNode[] | undefined;
					if (!Array.isArray(specs)) break;
					for (const spec of specs) {
						const local = spec.local as AnyNode | undefined;
						const name = local && typeof local.name === "string" ? local.name : null;
						if (!name) continue;
						if (spec.type === "ImportNamespaceSpecifier") {
							out.push({ name, kind: "namespace-import", source });
						} else if (spec.type === "ImportDefaultSpecifier") {
							out.push({ name, kind: "default-import", source });
						} else if (spec.type === "ImportSpecifier") {
							out.push({ name, kind: "named-import", source });
						}
					}
					break;
				}
				case "VariableDeclaration": {
					const declarations = stmt.declarations as AnyNode[] | undefined;
					if (!Array.isArray(declarations)) break;
					for (const d of declarations) {
						const id = d.id as AnyNode | undefined;
						if (id && id.type === "Identifier" && typeof id.name === "string") {
							out.push({ name: id.name as string, kind: "local" });
						}
					}
					break;
				}
				case "FunctionDeclaration":
				case "ClassDeclaration": {
					const id = stmt.id as AnyNode | undefined;
					if (id && typeof id.name === "string") {
						out.push({ name: id.name as string, kind: "local" });
					}
					break;
				}
			}
		}
	};
	collectFromScript(ast.instance as AnyNode | undefined);
	collectFromScript(ast.module as AnyNode | undefined);
	return out;
}

function collectShadowedNames(pattern: AnyNode | null | undefined, into: Set<string>): void {
	if (!pattern || typeof pattern !== "object") return;
	if (pattern.type === "Identifier" && typeof pattern.name === "string") {
		into.add(pattern.name as string);
		return;
	}
	if (pattern.type === "ArrayPattern") {
		const elements = pattern.elements as AnyNode[] | undefined;
		if (Array.isArray(elements)) {
			for (const el of elements) collectShadowedNames(el, into);
		}
		return;
	}
	if (pattern.type === "ObjectPattern") {
		const properties = pattern.properties as AnyNode[] | undefined;
		if (Array.isArray(properties)) {
			for (const prop of properties) {
				if (prop.type === "Property") {
					collectShadowedNames(prop.value as AnyNode | undefined, into);
				} else if (prop.type === "RestElement") {
					collectShadowedNames(prop.argument as AnyNode | undefined, into);
				}
			}
		}
		return;
	}
	if (pattern.type === "RestElement") {
		collectShadowedNames(pattern.argument as AnyNode | undefined, into);
		return;
	}
	if (pattern.type === "AssignmentPattern") {
		collectShadowedNames(pattern.left as AnyNode | undefined, into);
		return;
	}
}

async function loadExports(
	absPath: string,
	cache: Map<string, Set<string> | null>,
): Promise<Set<string> | null> {
	const cached = cache.get(absPath);
	if (cached !== undefined) return cached;
	if (!(await Bun.file(absPath).exists())) {
		cache.set(absPath, null);
		return null;
	}
	const text = await Bun.file(absPath).text();
	const ext = absPath.toLowerCase();
	if (ext.endsWith(".svelte")) {
		const set = new Set(["default"]);
		cache.set(absPath, set);
		return set;
	}
	// `export * from "..."` is opaque to a static scan — Bun.Transpiler.scan
	// returns names declared locally, not re-exported star members. Treat such
	// modules as un-introspectable so we don't false-positive on, e.g.,
	// barrel files. The regex tolerates `export *`, `export * as Foo`, and
	// preceding whitespace.
	if (/(^|\n)\s*export\s+\*/.test(text)) {
		cache.set(absPath, null);
		return null;
	}
	try {
		const loader: "ts" | "tsx" | "js" | "jsx" = ext.endsWith(".tsx")
			? "tsx"
			: ext.endsWith(".jsx")
				? "jsx"
				: ext.endsWith(".js") || ext.endsWith(".mjs")
					? "js"
					: "ts";
		const scan = new Bun.Transpiler({ loader }).scan(text);
		const exports = new Set<string>(scan.exports ?? []);
		cache.set(absPath, exports);
		return exports;
	} catch {
		cache.set(absPath, null);
		return null;
	}
}

function levenshtein1(a: string, b: string): boolean {
	if (a === b) return false;
	const la = a.length;
	const lb = b.length;
	if (Math.abs(la - lb) > 1) return false;
	if (la === lb) {
		let diffs = 0;
		for (let i = 0; i < la; i++) {
			if (a[i] !== b[i] && ++diffs > 1) return false;
		}
		return diffs === 1;
	}
	const [s, l] = la < lb ? [a, b] : [b, a];
	let i = 0;
	let j = 0;
	let edits = 0;
	while (i < s.length && j < l.length) {
		if (s[i] !== l[j]) {
			if (++edits > 1) return false;
			j++;
		} else {
			i++;
			j++;
		}
	}
	return true;
}

function bestSuggestion(target: string, available: Set<string>): string | null {
	for (const name of available) {
		if (levenshtein1(target.toLowerCase(), name.toLowerCase())) return name;
	}
	return null;
}

const PROMOTABLE_WARNING_CODES = new Set([
	"component_name_lowercase",
	"bind_invalid_value",
	"invalid_html_attribute",
]);

// Skip these template node types — they're not user-defined components and
// reference no JS binding.
const SKIP_TEMPLATE_TYPES = new Set([
	"SvelteSelf",
	"SvelteElement",
	"SvelteFragment",
	"SvelteHead",
	"SvelteBody",
	"SvelteWindow",
	"SvelteDocument",
	"SvelteOptions",
	"SvelteBoundary",
	"RegularElement",
	"TitleElement",
	"SlotElement",
]);

interface TemplateRef {
	name: string;
	line: number;
	col: number;
	shadow: Set<string>;
}

function collectTemplateRefs(source: string, fragment: AnyNode): TemplateRef[] {
	const refs: TemplateRef[] = [];
	const scopeStack: Array<Set<string>> = [];

	const visit = (n: AnyNode, _parent: AnyNode | null): boolean | void => {
		if (n.type === "ConstTag") {
			// Handled by the Fragment pre-pass in walkWithScope — siblings need
			// the binding visible across the fragment, not just for ConstTag's
			// own children.
			return;
		}
		if (n.type === "EachBlock") {
			const ctx = n.context as AnyNode | null | undefined;
			const indexName = typeof n.index === "string" ? (n.index as string) : null;
			const names = new Set<string>();
			collectShadowedNames(ctx ?? null, names);
			if (indexName) names.add(indexName);
			scopeStack.push(names);
			return; // continue walking children
		}
		if (n.type === "SnippetBlock") {
			const params = n.parameters as AnyNode[] | undefined;
			const names = new Set<string>();
			if (Array.isArray(params)) {
				for (const p of params) collectShadowedNames(p, names);
			}
			// Snippet identifier itself is a local in the surrounding scope; the
			// outer binding extractor already records top-level `{#snippet}`
			// declarations? No — `{#snippet}` is template-level. Add the snippet
			// name into the surrounding scope so `<MySnippet/>` doesn't false-
			// positive. The expression's name is the snippet's identifier.
			const expr = n.expression as AnyNode | undefined;
			const snippetName =
				expr && typeof expr.name === "string" ? (expr.name as string) : null;
			if (snippetName && scopeStack.length > 0) {
				scopeStack[scopeStack.length - 1].add(snippetName);
			} else if (snippetName) {
				// Top-level snippet — push into a synthetic root scope.
				if (scopeStack.length === 0) scopeStack.push(new Set());
				scopeStack[0].add(snippetName);
			}
			scopeStack.push(names);
			return;
		}
		if (n.type === "Component") {
			const name = typeof n.name === "string" ? (n.name as string) : "";
			if (name) {
				const start = typeof n.start === "number" ? (n.start as number) : 0;
				const { line, col } = lineColFromOffset(source, start);
				const shadow = new Set<string>();
				for (const s of scopeStack) for (const v of s) shadow.add(v);
				refs.push({ name, line, col, shadow });
			}
			return;
		}
		if (n.type === "SvelteComponent") {
			const expr = n.expression as AnyNode | undefined;
			if (expr && expr.type === "Identifier" && typeof expr.name === "string") {
				const start = typeof n.start === "number" ? (n.start as number) : 0;
				const { line, col } = lineColFromOffset(source, start);
				const shadow = new Set<string>();
				for (const s of scopeStack) for (const v of s) shadow.add(v);
				refs.push({ name: expr.name as string, line, col, shadow });
			}
			return;
		}
		if (SKIP_TEMPLATE_TYPES.has(n.type ?? "")) {
			return;
		}
	};

	// Custom DFS that pops scopes when leaving Each/Snippet/Fragment nodes.
	const walkWithScope = (node: unknown, parent: AnyNode | null) => {
		if (!node) return;
		if (Array.isArray(node)) {
			for (const c of node) walkWithScope(c, parent);
			return;
		}
		if (typeof node !== "object") return;
		const n = node as AnyNode;
		let pushed = false;
		if (typeof n.type === "string") {
			const before = scopeStack.length;
			visit(n, parent);
			if (scopeStack.length > before) pushed = true;
		}
		// Fragment pre-pass: `{@const}` bindings live across all siblings in the
		// surrounding fragment, so collect them before descending. Without this,
		// `<ComponentPreview>{@const X = ...}<X /></ComponentPreview>` would
		// false-positive on `<X />`.
		let fragmentScopePushed = false;
		if (n.type === "Fragment" && Array.isArray(n.nodes)) {
			const fragmentScope = new Set<string>();
			for (const child of n.nodes as AnyNode[]) {
				if (child && child.type === "ConstTag") {
					const decl = child.declaration as AnyNode | undefined;
					const decls = (decl?.declarations as AnyNode[] | undefined) ?? [];
					for (const d of decls) {
						collectShadowedNames(d.id as AnyNode | undefined, fragmentScope);
					}
				}
			}
			if (fragmentScope.size > 0) {
				scopeStack.push(fragmentScope);
				fragmentScopePushed = true;
			}
		}
		for (const key of CHILD_KEYS) {
			const child = n[key];
			if (child) walkWithScope(child, n);
		}
		if (fragmentScopePushed) scopeStack.pop();
		if (pushed) scopeStack.pop();
	};

	walkWithScope(fragment, null);
	return refs;
}

export async function auditSvelteSource(opts: SvelteAuditOptions): Promise<string | null> {
	const { source, filename, ast, warnings, cwd, exportCache, strict } = opts;
	const flags = resolveStrict(strict);
	const envOverride = process.env.BOSIA_STRICT_IMPORTS === "0";

	const root = ast as AnyNode | undefined;
	if (!root || !root.fragment) return null;

	const errors: AuditError[] = [];

	if (flags.unbound || flags.namespaceMember) {
		const bindings = extractBindings(root);
		const bindingByName = new Map<string, Binding>();
		for (const b of bindings) bindingByName.set(b.name, b);

		const refs = collectTemplateRefs(source, root.fragment as AnyNode);

		for (const ref of refs) {
			// Builtin / svelte special tags (already filtered as separate AST types).
			if (ref.name.includes(":")) continue;
			const dotIdx = ref.name.indexOf(".");
			const head = dotIdx === -1 ? ref.name : ref.name.slice(0, dotIdx);
			const member = dotIdx === -1 ? null : ref.name.slice(dotIdx + 1);

			// Heuristic: lowercase head with no member is an HTML element that
			// somehow landed in Component (rare — usually svelte/compiler rejects).
			// Bail to avoid false positives.
			if (!head || head.length === 0) continue;

			if (ref.shadow.has(head)) continue;

			const binding = bindingByName.get(head);
			if (!binding) {
				if (flags.unbound) {
					errors.push({
						kind: "unbound-identifier",
						line: ref.line,
						col: ref.col,
						message: `<${ref.name}> — identifier \`${head}\` is not imported or declared in this component.`,
					});
				}
				continue;
			}

			if (!member) continue;

			if (binding.kind !== "namespace-import") {
				if (flags.namespaceMember) {
					errors.push({
						kind: "dotted-on-non-namespace",
						line: ref.line,
						col: ref.col,
						message:
							`<${ref.name}> — \`${head}\` is a ` +
							(binding.kind === "named-import"
								? "named import"
								: binding.kind === "default-import"
									? "default import"
									: "local declaration") +
							`; only namespace imports (\`import * as ${head} from ...\`) support \`${head}.${member}\` usage.`,
					});
				}
				continue;
			}

			if (!flags.namespaceMember) continue;

			const spec = binding.source ?? "";
			const resolved = await resolveImportPath(spec, filename, cwd);
			if (resolved.kind === "bare" || resolved.kind === "virtual" || !resolved.path) {
				// Bare-package / virtual sources are out of scope — too easy to
				// false-positive on tree-shaken barrels (e.g. `lucide-svelte`).
				continue;
			}

			const exportsSet = await loadExports(resolved.path, exportCache);
			if (!exportsSet) continue; // un-introspectable source
			if (exportsSet.has(member)) continue;

			const available = Array.from(exportsSet).filter((e) => e !== "default");
			const hint = bestSuggestion(member, exportsSet);
			const availableStr = available.length
				? `Available exports: ${available.join(", ")}.`
				: `Module has no named exports.`;
			const hintStr = hint ? ` Did you mean \`<${head}.${hint}>\`?` : "";
			errors.push({
				kind: "missing-namespace-export",
				line: ref.line,
				col: ref.col,
				message: `<${ref.name}> — namespace import \`${head}\` (from "${spec}") has no export \`${member}\`. ${availableStr}${hintStr}`,
			});
		}
	}

	if (flags.warnings && Array.isArray(warnings)) {
		for (const w of warnings) {
			if (!w || !w.code) continue;
			if (!PROMOTABLE_WARNING_CODES.has(w.code)) continue;
			const line = w.start?.line ?? 1;
			const col = (w.start?.column ?? 0) + 1;
			errors.push({
				kind: "warning",
				line,
				col,
				message: `[${w.code}] ${w.message ?? "(no message)"}`,
			});
		}
	}

	if (errors.length === 0) return null;

	errors.sort((a, b) => a.line - b.line || a.col - b.col);
	const header = `Svelte component-import audit failed: ${filename}`;
	const body = errors
		.map((e) => {
			const loc = `  ${e.line}:${e.col}`;
			return `${loc}  ${e.message}`;
		})
		.join("\n");
	const footer =
		"\n\nSet BOSIA_STRICT_IMPORTS=0 to downgrade these to warnings, or configure \`strictImports\` in bosia.config.ts.";

	const formatted = `${header}\n\n${body}${footer}`;

	if (envOverride) {
		console.warn(`[bosia] ${formatted}`);
		return null;
	}
	return formatted;
}
