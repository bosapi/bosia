import { join, dirname } from "path";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "fs";
import * as p from "@clack/prompts";
import {
	type InstallOptions,
	REGISTRY_URL,
	resolveLocalRegistryOrExit,
	readRegistryJSON,
	readRegistryFile,
	mergePkgJson,
	bunAdd,
} from "./registry.ts";

// ─── bosia add <component> ────────────────────────────────
// Fetches a component from the GitHub registry (or local registry
// with --local) and copies it into src/lib/components/<path>/.
//
// Path-based names:
//   bosia add button       → src/lib/components/ui/button/
//   bosia add shop/cart    → src/lib/components/shop/cart/

interface ComponentMeta {
	name: string;
	description: string;
	dependencies: string[]; // other bosia components required
	files: string[];
	npmDeps: Record<string, string>;
}

interface RegistryIndex {
	components: string[];
	features: string[];
}

// Track already-installed components within a session to avoid re-running deps
const installed = new Set<string>();

// Resolved once in runAdd or initAddRegistry, used by addComponent
let registryRoot: string | null = null;
let registryIndex: RegistryIndex | null = null;

/** Initialize registry context so addComponent can be called externally (e.g. from feat.ts) */
export async function initAddRegistry(root: string | null) {
	registryRoot = root;
	registryIndex = await loadIndex();
}

export async function runAdd(name: string | undefined, flags: string[] = []) {
	if (!name) {
		console.error(
			"❌ Please provide a component name.\n   Usage: bosia add <component> [--local]",
		);
		process.exit(1);
	}

	if (flags.includes("--local")) {
		registryRoot = resolveLocalRegistryOrExit();
		console.log(`⬡ Using local registry: ${registryRoot}\n`);
	}

	// Load index once to resolve component paths
	registryIndex = await loadIndex();

	ensureUtils();
	await addComponent(name, true);
}

/**
 * Resolve the full registry path for a component using the index.
 * - "todo"       → "todo"          (exact match in index)
 * - "button"     → "ui/button"     (suffix match in index)
 * - "shop/cart"  → "shop/cart"     (explicit path used as-is)
 */
function resolveDestPath(name: string): string {
	if (name.includes("/")) return name;

	if (registryIndex) {
		// Exact match (e.g. "todo" → "todo")
		if (registryIndex.components.includes(name)) return name;
		// Suffix match (e.g. "button" → "ui/button")
		const match = registryIndex.components.find((c) => c.endsWith(`/${name}`));
		if (match) return match;
	}

	// Fallback for backwards compatibility
	return `ui/${name}`;
}

async function loadIndex(): Promise<RegistryIndex | null> {
	try {
		if (registryRoot) {
			const path = join(registryRoot, "index.json");
			if (existsSync(path)) return JSON.parse(readFileSync(path, "utf-8"));
			return null;
		}
		const res = await fetch(`${REGISTRY_URL}/index.json`);
		if (!res.ok) return null;
		return (await res.json()) as RegistryIndex;
	} catch {
		return null;
	}
}

export async function addComponent(name: string, root = false, options?: InstallOptions) {
	// Resolve the full path (e.g. "button" → "ui/button", "shop/cart" stays "shop/cart")
	const fullPath = resolveDestPath(name);

	if (installed.has(fullPath)) return;
	installed.add(fullPath);

	const cwd = options?.cwd ?? process.cwd();

	console.log(root ? `⬡ Installing component: ${name}\n` : `   📦 Dependency: ${name}`);

	const meta = await readRegistryJSON<ComponentMeta>(
		registryRoot,
		"components",
		fullPath,
		"meta.json",
	);

	// Install component dependencies first (recursive)
	for (const dep of meta.dependencies) {
		await addComponent(dep, false, options);
	}

	// Check if component already exists (skip check entirely in non-interactive mode)
	const destDir = join(cwd, "src", "lib", "components", fullPath);
	if (!options?.skipPrompts && existsSync(destDir)) {
		const replace = await p.confirm({
			message: `Component "${name}" already exists at src/lib/components/${fullPath}/. Replace it?`,
		});
		if (p.isCancel(replace) || !replace) {
			console.log(`   ⏭️  Skipped ${name}`);
			return;
		}
	}

	// Download/copy component files into src/lib/components/<fullPath>/
	mkdirSync(destDir, { recursive: true });

	for (const file of meta.files) {
		const content = await readRegistryFile(registryRoot, "components", fullPath, file);
		const dest = join(destDir, file);
		if (file.includes("/")) mkdirSync(dirname(dest), { recursive: true });
		writeFileSync(dest, content, "utf-8");
		console.log(`   ✍️  src/lib/components/${fullPath}/${file}`);
	}

	// Install npm dependencies
	if (Object.keys(meta.npmDeps).length > 0) {
		if (options?.skipInstall) {
			const { addedDeps } = mergePkgJson(cwd, { deps: meta.npmDeps });
			if (addedDeps.length > 0)
				console.log(`   📥 Added to package.json: ${addedDeps.join(", ")}`);
		} else {
			await bunAdd(cwd, meta.npmDeps);
		}
	}

	if (root) console.log(`\n✅ ${name} installed at src/lib/components/${fullPath}/`);
}

// ─── Ensure $lib/utils.ts exists ─────────────────────────────

const UTILS_CONTENT = `import { twMerge } from "tailwind-merge";

type ClassDictionary = Record<string, any>;
type ClassArray = ClassValue[];
type ClassValue = ClassArray | ClassDictionary | string | number | bigint | null | boolean | undefined;

function clsx(...inputs: ClassValue[]): string {
    let str = '';
    for (const input of inputs) {
        if (!input) continue;
        if (typeof input === 'string' || typeof input === 'number') {
            str && (str += ' ');
            str += input;
        } else if (Array.isArray(input)) {
            const inner = clsx(...input);
            if (inner) { str && (str += ' '); str += inner; }
        } else if (typeof input === 'object') {
            for (const k in input) {
                if ((input as ClassDictionary)[k]) { str && (str += ' '); str += k; }
            }
        }
    }
    return str;
}

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
`;

function ensureUtils() {
	const utilsPath = join(process.cwd(), "src", "lib", "utils.ts");
	if (!existsSync(utilsPath)) {
		mkdirSync(dirname(utilsPath), { recursive: true });
		writeFileSync(utilsPath, UTILS_CONTENT, "utf-8");
		console.log("   ✍️  src/lib/utils.ts (cn utility)\n");
	}
}
