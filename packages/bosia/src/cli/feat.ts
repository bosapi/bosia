import { join, dirname } from "path";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "fs";
import * as p from "@clack/prompts";
import { addComponent, initAddRegistry } from "./add.ts";
import {
    resolveLocalRegistry,
    readRegistryJSON,
    readRegistryFile,
    mergePkgJson,
    bunAdd,
} from "./registry.ts";

// ─── bosia feat <feature> [--local] ──────────────────────
// Fetches a feature scaffold from the GitHub registry (or local
// registry with --local) and copies route/lib files, installs npm deps.
// Supports nested feature dependencies (e.g. todo → drizzle).

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

export interface InstallOptions {
    skipInstall?: boolean;  // write deps to package.json instead of `bun add`
    skipPrompts?: boolean;  // auto-overwrite, no interactive prompts
    cwd?: string;           // override process.cwd() for file operations
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
        try {
            registryRoot = resolveLocalRegistry();
        } catch {
            console.error("❌ Could not find local registry/ directory.");
            process.exit(1);
        }
        console.log(`⬡ Using local registry: ${registryRoot}\n`);
    }

    // Initialize add.ts registry context so addComponent resolves paths correctly
    await initAddRegistry(registryRoot);

    await installFeature(name, true);
}

/** Set the registry root for feature resolution. Called by create.ts for template features. */
export function initFeatRegistry(root: string | null) {
    registryRoot = root;
}

export async function installFeature(name: string, isRoot: boolean, options?: InstallOptions) {
    if (installedFeats.has(name)) return;
    installedFeats.add(name);

    const cwd = options?.cwd ?? process.cwd();

    console.log(isRoot ? `⬡ Installing feature: ${name}\n` : `\n⬡ Installing dependency feature: ${name}\n`);

    const meta = await readRegistryJSON<FeatureMeta>(registryRoot, "features", name, "meta.json");

    // Install required feature dependencies first (recursive)
    if (meta.features && meta.features.length > 0) {
        for (const feat of meta.features) {
            await installFeature(feat, false, options);
        }
    }

    // Install required UI components
    if (meta.components.length > 0) {
        console.log("📦 Installing required components...");
        for (const comp of meta.components) {
            await addComponent(comp, false, options);
        }
        console.log("");
    }

    // Copy feature files to their target paths
    const createdDirs = new Set<string>();
    for (let i = 0; i < meta.files.length; i++) {
        const file = meta.files[i]!;
        const target = meta.targets[i] ?? file;
        const dest = join(cwd, target);

        // Prompt before overwriting existing files (skip check entirely in non-interactive mode)
        if (!options?.skipPrompts && existsSync(dest)) {
            const replace = await p.confirm({
                message: `File "${target}" already exists. Replace it?`,
            });
            if (p.isCancel(replace) || !replace) {
                console.log(`   ⏭️  Skipped ${target}`);
                continue;
            }
        }

        const content = await readRegistryFile(registryRoot, "features", name, file);
        const dir = dirname(dest);
        if (!createdDirs.has(dir)) {
            mkdirSync(dir, { recursive: true });
            createdDirs.add(dir);
        }
        writeFileSync(dest, content, "utf-8");
        console.log(`   ✍️  ${target}`);
    }

    // Install npm dependencies
    if (Object.keys(meta.npmDeps).length > 0) {
        if (options?.skipInstall) {
            // Separate deps vs devDeps (drizzle-kit is a devDep)
            const deps: Record<string, string> = {};
            const devDeps: Record<string, string> = {};
            for (const [name, ver] of Object.entries(meta.npmDeps)) {
                if (name === "drizzle-kit") {
                    devDeps[name] = ver;
                } else {
                    deps[name] = ver;
                }
            }
            const { addedDeps, addedScripts } = mergePkgJson(cwd, { deps, devDeps, scripts: meta.scripts });
            if (addedDeps.length > 0) console.log(`\n📥 Added to package.json: ${addedDeps.join(", ")}`);
            if (addedScripts.length > 0) console.log(`\n📜 Added scripts: ${addedScripts.join(", ")}`);
        } else {
            await bunAdd(cwd, meta.npmDeps);
            if (meta.scripts && Object.keys(meta.scripts).length > 0) {
                const { addedScripts } = mergePkgJson(cwd, { scripts: meta.scripts });
                if (addedScripts.length > 0) console.log(`\n📜 Added scripts: ${addedScripts.join(", ")}`);
            }
        }
    } else if (meta.scripts && Object.keys(meta.scripts).length > 0) {
        const { addedScripts } = mergePkgJson(cwd, { scripts: meta.scripts });
        if (addedScripts.length > 0) console.log(`\n📜 Added scripts: ${addedScripts.join(", ")}`);
    }

    // Append env vars to .env if missing
    const envEntries = Object.entries(meta.envVars ?? {});
    if (envEntries.length > 0) {
        const envPath = join(cwd, ".env");
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

// Re-export for create.ts
export { resolveLocalRegistry } from "./registry.ts";
