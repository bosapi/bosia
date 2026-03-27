import { join, dirname } from "path";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "fs";
import { spawn } from "bun";
import * as p from "@clack/prompts";

// ─── bosia add <component> ────────────────────────────────
// Fetches a component from the GitHub registry (or local registry
// with --local) and copies it into src/lib/components/<path>/.
//
// Path-based names:
//   bosia add button       → src/lib/components/ui/button/
//   bosia add shop/cart    → src/lib/components/shop/cart/

const REMOTE_BASE = "https://bosia.bosapi.com/api/registry";

interface ComponentMeta {
    name: string;
    description: string;
    dependencies: string[];   // other bosia components required
    files: string[];
    npmDeps: Record<string, string>;
}

// Track already-installed components within a session to avoid re-running deps
const installed = new Set<string>();

// Resolved once in runAdd, used by addComponent
let registryRoot: string | null = null;

export async function runAdd(name: string | undefined, flags: string[] = []) {
    if (!name) {
        console.error("❌ Please provide a component name.\n   Usage: bosia add <component> [--local]");
        process.exit(1);
    }

    if (flags.includes("--local")) {
        // Walk up from this file to find the repo's registry/ directory
        registryRoot = resolveLocalRegistry();
        console.log(`⬡ Using local registry: ${registryRoot}\n`);
    }

    ensureUtils();
    await addComponent(name, true);
}

/**
 * Resolve the destination path for a component.
 * - "button"     → "ui/button"     (default ui/ prefix)
 * - "shop/cart"  → "shop/cart"     (explicit path used as-is)
 */
function resolveDestPath(name: string): string {
    return name.includes("/") ? name : `ui/${name}`;
}

export async function addComponent(name: string, root = false) {
    // Resolve the full path (e.g. "button" → "ui/button", "shop/cart" stays "shop/cart")
    const fullPath = resolveDestPath(name);

    if (installed.has(fullPath)) return;
    installed.add(fullPath);

    console.log(root ? `⬡ Installing component: ${name}\n` : `   📦 Dependency: ${name}`);

    const meta = await readMeta(fullPath);

    // Install component dependencies first (recursive)
    for (const dep of meta.dependencies) {
        await addComponent(dep, false);
    }

    // Check if component already exists
    const destDir = join(process.cwd(), "src", "lib", "components", fullPath);
    if (existsSync(destDir)) {
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
        const content = await readFile(fullPath, file);
        const dest = join(destDir, file);
        mkdirSync(dirname(dest), { recursive: true });
        writeFileSync(dest, content, "utf-8");
        console.log(`   ✍️  src/lib/components/${fullPath}/${file}`);
    }

    // Install npm dependencies
    const npmEntries = Object.entries(meta.npmDeps);
    if (npmEntries.length > 0) {
        const packages = npmEntries.map(([pkg, ver]) => (ver ? `${pkg}@${ver}` : pkg));
        console.log(`   📥 npm: ${packages.join(", ")}`);
        const proc = spawn(["bun", "add", ...packages], {
            stdout: "inherit",
            stderr: "inherit",
            cwd: process.cwd(),
        });
        if ((await proc.exited) !== 0) {
            console.warn(`   ⚠️  bun add failed for: ${packages.join(", ")}`);
        }
    }

    if (root) console.log(`\n✅ ${name} installed at src/lib/components/${fullPath}/`);
}

// ─── Ensure $lib/utils.ts exists ─────────────────────────────

const UTILS_CONTENT = `import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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

// ─── Registry resolvers ──────────────────────────────────────

function resolveLocalRegistry(): string {
    // Walk up from this file's directory to find registry/
    let dir = dirname(new URL(import.meta.url).pathname);
    for (let i = 0; i < 10; i++) {
        const candidate = join(dir, "registry");
        if (existsSync(join(candidate, "index.json"))) return candidate;
        const parent = dirname(dir);
        if (parent === dir) break;
        dir = parent;
    }
    console.error("❌ Could not find local registry/ directory.");
    process.exit(1);
}

async function readMeta(name: string): Promise<ComponentMeta> {
    if (registryRoot) {
        const path = join(registryRoot, "components", name, "meta.json");
        if (!existsSync(path)) {
            throw new Error(`Component "${name}" not found in local registry`);
        }
        return JSON.parse(readFileSync(path, "utf-8"));
    }
    return fetchJSON<ComponentMeta>(`${REMOTE_BASE}/components/${name}/meta.json`);
}

async function readFile(name: string, file: string): Promise<string> {
    if (registryRoot) {
        const path = join(registryRoot, "components", name, file);
        if (!existsSync(path)) {
            throw new Error(`File "${file}" not found for component "${name}" in local registry`);
        }
        return readFileSync(path, "utf-8");
    }
    return fetchText(`${REMOTE_BASE}/components/${name}/${file}`);
}

async function fetchJSON<T>(url: string): Promise<T> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url} (${res.status})`);
    return res.json() as Promise<T>;
}

async function fetchText(url: string): Promise<string> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url} (${res.status})`);
    return res.text();
}
