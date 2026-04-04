import { join, dirname } from "path";
import { writeFileSync, readFileSync, existsSync } from "fs";
import { spawn } from "bun";

// ─── Shared registry utilities for feat.ts and add.ts ─────

export const REGISTRY_URL = "https://raw.githubusercontent.com/bosapi/bosia/main/registry";

// ─── Local registry resolution ────────────────────────────

export function resolveLocalRegistry(): string {
    let dir = dirname(new URL(import.meta.url).pathname);
    for (let i = 0; i < 10; i++) {
        const candidate = join(dir, "registry");
        if (existsSync(join(candidate, "index.json"))) return candidate;
        const parent = dirname(dir);
        if (parent === dir) break;
        dir = parent;
    }
    throw new Error("Could not find local registry/ directory.");
}

// ─── Registry file readers ────────────────────────────────

/** Read and parse a JSON file from the registry (local or remote). */
export async function readRegistryJSON<T>(
    registryRoot: string | null,
    category: string,
    name: string,
    file: string,
): Promise<T> {
    if (registryRoot) {
        const path = join(registryRoot, category, name, file);
        if (!existsSync(path)) {
            throw new Error(`"${file}" not found for ${category.slice(0, -1)} "${name}" in local registry`);
        }
        return JSON.parse(readFileSync(path, "utf-8"));
    }
    return fetchJSON<T>(`${REGISTRY_URL}/${category}/${name}/${file}`);
}

/** Read a text file from the registry (local or remote). */
export async function readRegistryFile(
    registryRoot: string | null,
    category: string,
    name: string,
    file: string,
): Promise<string> {
    if (registryRoot) {
        const path = join(registryRoot, category, name, file);
        if (!existsSync(path)) {
            throw new Error(`File "${file}" not found for ${category.slice(0, -1)} "${name}" in local registry`);
        }
        return readFileSync(path, "utf-8");
    }
    return fetchText(`${REGISTRY_URL}/${category}/${name}/${file}`);
}

// ─── package.json helpers ─────────────────────────────────

export interface PkgDeps {
    deps?: Record<string, string>;
    devDeps?: Record<string, string>;
    scripts?: Record<string, string>;
}

/**
 * Merge dependencies and scripts into package.json in a single read/write.
 * Returns the list of added keys, or empty arrays if nothing changed.
 */
export function mergePkgJson(cwd: string, changes: PkgDeps): { addedDeps: string[]; addedScripts: string[] } {
    const pkgPath = join(cwd, "package.json");
    if (!existsSync(pkgPath)) return { addedDeps: [], addedScripts: [] };

    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
    let changed = false;
    const addedDeps: string[] = [];
    const addedScripts: string[] = [];

    if (changes.deps && Object.keys(changes.deps).length > 0) {
        pkg.dependencies = pkg.dependencies ?? {};
        for (const [name, ver] of Object.entries(changes.deps)) {
            if (!pkg.dependencies[name]) {
                pkg.dependencies[name] = ver;
                addedDeps.push(name);
                changed = true;
            }
        }
    }

    if (changes.devDeps && Object.keys(changes.devDeps).length > 0) {
        pkg.devDependencies = pkg.devDependencies ?? {};
        for (const [name, ver] of Object.entries(changes.devDeps)) {
            if (!pkg.devDependencies[name]) {
                pkg.devDependencies[name] = ver;
                addedDeps.push(name);
                changed = true;
            }
        }
    }

    if (changes.scripts && Object.keys(changes.scripts).length > 0) {
        pkg.scripts = pkg.scripts ?? {};
        for (const [key, val] of Object.entries(changes.scripts)) {
            if (!pkg.scripts[key]) {
                pkg.scripts[key] = val;
                addedScripts.push(key);
                changed = true;
            }
        }
    }

    if (changed) {
        writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf-8");
    }

    return { addedDeps, addedScripts };
}

/** Run `bun add` for a list of packages. */
export async function bunAdd(cwd: string, deps: Record<string, string>): Promise<void> {
    const packages = Object.entries(deps).map(([pkg, ver]) => (ver ? `${pkg}@${ver}` : pkg));
    if (packages.length === 0) return;
    console.log(`\n📥 npm: ${packages.join(", ")}`);
    const proc = spawn(["bun", "add", ...packages], {
        stdout: "inherit",
        stderr: "inherit",
        cwd,
    });
    if ((await proc.exited) !== 0) {
        console.warn(`⚠️  bun add failed for: ${packages.join(", ")}`);
    }
}

// ─── HTTP helpers ─────────────────────────────────────────

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
