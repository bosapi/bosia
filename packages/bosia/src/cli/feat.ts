import { join, dirname } from "path";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "fs";
import { spawn } from "bun";
import * as p from "@clack/prompts";
import { addComponent, initAddRegistry } from "./add.ts";

// ─── bosia feat <feature> [--local] ──────────────────────
// Fetches a feature scaffold from the GitHub registry (or local
// registry with --local) and copies route/lib files, installs npm deps.
// Supports nested feature dependencies (e.g. todo → drizzle).

const REGISTRY_BASE = "https://raw.githubusercontent.com/bosapi/bosia/main/registry";

interface FeatureMeta {
    name: string;
    description: string;
    features?: string[];               // other bosia features required
    components: string[];              // bosia components to install via `bosia add`
    files: string[];                   // source filenames in the registry feature dir
    targets: string[];                 // destination paths relative to project root
    npmDeps: Record<string, string>;
    scripts?: Record<string, string>;  // package.json scripts to add
    envVars?: Record<string, string>;  // env vars to append to .env if missing
}

let registryRoot: string | null = null;

// Track installed features to prevent circular dependencies
const installedFeats = new Set<string>();

export async function runFeat(name: string | undefined, flags: string[] = []) {
    if (!name) {
        console.error("❌ Please provide a feature name.\n   Usage: bosia feat <feature> [--local]");
        process.exit(1);
    }

    if (flags.includes("--local")) {
        registryRoot = resolveLocalRegistry();
        console.log(`⬡ Using local registry: ${registryRoot}\n`);
    }

    // Initialize add.ts registry context so addComponent resolves paths correctly
    await initAddRegistry(registryRoot);

    await installFeature(name, true);
}

async function installFeature(name: string, isRoot: boolean) {
    if (installedFeats.has(name)) return;
    installedFeats.add(name);

    console.log(isRoot ? `⬡ Installing feature: ${name}\n` : `\n⬡ Installing dependency feature: ${name}\n`);

    const meta = await readMeta(name);

    // Install required feature dependencies first (recursive)
    if (meta.features && meta.features.length > 0) {
        for (const feat of meta.features) {
            await installFeature(feat, false);
        }
    }

    // Install required UI components
    if (meta.components.length > 0) {
        console.log("📦 Installing required components...");
        for (const comp of meta.components) {
            await addComponent(comp, false);
        }
        console.log("");
    }

    // Copy feature files to their target paths
    for (let i = 0; i < meta.files.length; i++) {
        const file = meta.files[i]!;
        const target = meta.targets[i] ?? file;
        const dest = join(process.cwd(), target);

        // Prompt before overwriting existing files
        if (existsSync(dest)) {
            const replace = await p.confirm({
                message: `File "${target}" already exists. Replace it?`,
            });
            if (p.isCancel(replace) || !replace) {
                console.log(`   ⏭️  Skipped ${target}`);
                continue;
            }
        }

        const content = await readFile(name, file);
        mkdirSync(dirname(dest), { recursive: true });
        writeFileSync(dest, content, "utf-8");
        console.log(`   ✍️  ${target}`);
    }

    // Install npm dependencies
    const npmEntries = Object.entries(meta.npmDeps);
    if (npmEntries.length > 0) {
        const packages = npmEntries.map(([pkg, ver]) => (ver ? `${pkg}@${ver}` : pkg));
        console.log(`\n📥 npm: ${packages.join(", ")}`);
        const proc = spawn(["bun", "add", ...packages], {
            stdout: "inherit",
            stderr: "inherit",
            cwd: process.cwd(),
        });
        if ((await proc.exited) !== 0) {
            console.warn(`⚠️  bun add failed for: ${packages.join(", ")}`);
        }
    }

    // Add package.json scripts
    const scriptEntries = Object.entries(meta.scripts ?? {});
    if (scriptEntries.length > 0) {
        const pkgPath = join(process.cwd(), "package.json");
        if (existsSync(pkgPath)) {
            const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
            pkg.scripts = pkg.scripts ?? {};
            const added: string[] = [];
            for (const [key, val] of scriptEntries) {
                if (!pkg.scripts[key]) {
                    pkg.scripts[key] = val;
                    added.push(key);
                }
            }
            if (added.length > 0) {
                writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf-8");
                console.log(`\n📜 Added scripts: ${added.join(", ")}`);
            }
        }
    }

    // Append env vars to .env if missing
    const envEntries = Object.entries(meta.envVars ?? {});
    if (envEntries.length > 0) {
        const envPath = join(process.cwd(), ".env");
        const existing = existsSync(envPath) ? readFileSync(envPath, "utf-8") : "";
        const toAdd: string[] = [];
        for (const [key, val] of envEntries) {
            if (!existing.includes(`${key}=`)) {
                toAdd.push(`${key}=${val}`);
            }
        }
        if (toAdd.length > 0) {
            const nl = existing.length > 0 && !existing.endsWith("\n") ? "\n" : "";
            writeFileSync(envPath, existing + nl + toAdd.join("\n") + "\n", "utf-8");
            console.log(`\n🔑 Added to .env: ${toAdd.map((l) => l.split("=")[0]).join(", ")}`);
        }
    }

    if (isRoot) {
        console.log(`\n✅ Feature "${name}" scaffolded!`);
        if (meta.description) console.log(`   ${meta.description}`);
    } else {
        console.log(`   ✅ Dependency feature "${name}" installed.`);
    }
}

// ─── Registry resolvers ──────────────────────────────────────

function resolveLocalRegistry(): string {
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

async function readMeta(name: string): Promise<FeatureMeta> {
    if (registryRoot) {
        const path = join(registryRoot, "features", name, "meta.json");
        if (!existsSync(path)) {
            throw new Error(`Feature "${name}" not found in local registry`);
        }
        return JSON.parse(readFileSync(path, "utf-8"));
    }
    return fetchJSON<FeatureMeta>(`${REGISTRY_BASE}/features/${name}/meta.json`);
}

async function readFile(name: string, file: string): Promise<string> {
    if (registryRoot) {
        const path = join(registryRoot, "features", name, file);
        if (!existsSync(path)) {
            throw new Error(`File "${file}" not found for feature "${name}" in local registry`);
        }
        return readFileSync(path, "utf-8");
    }
    return fetchText(`${REGISTRY_BASE}/features/${name}/${file}`);
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
