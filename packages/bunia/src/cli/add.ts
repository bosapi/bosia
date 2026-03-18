import { join, dirname } from "path";
import { mkdirSync, writeFileSync } from "fs";
import { spawn } from "bun";

// ─── bunia add <component> ────────────────────────────────
// Fetches a component from the GitHub registry and copies it
// into the user's src/lib/components/ui/<name>/ directory.

const REGISTRY_BASE = "https://raw.githubusercontent.com/bosapi/bunia/main/registry";

interface ComponentMeta {
    name: string;
    description: string;
    dependencies: string[];   // other bunia components required
    files: string[];
    npmDeps: Record<string, string>;
}

// Track already-installed components within a session to avoid re-running deps
const installed = new Set<string>();

export async function runAdd(name: string | undefined) {
    if (!name) {
        console.error("❌ Please provide a component name.\n   Usage: bunia add <component>");
        process.exit(1);
    }
    await addComponent(name, true);
}

export async function addComponent(name: string, root = false) {
    if (installed.has(name)) return;
    installed.add(name);

    console.log(root ? `🐰 Installing component: ${name}\n` : `   📦 Dependency: ${name}`);

    const meta = await fetchJSON<ComponentMeta>(`${REGISTRY_BASE}/components/${name}/meta.json`);

    // Install component dependencies first (recursive)
    for (const dep of meta.dependencies) {
        await addComponent(dep, false);
    }

    // Download component files into src/lib/components/ui/<name>/
    const destDir = join(process.cwd(), "src", "lib", "components", "ui", name);
    mkdirSync(destDir, { recursive: true });

    for (const file of meta.files) {
        const content = await fetchText(`${REGISTRY_BASE}/components/${name}/${file}`);
        const dest = join(destDir, file);
        mkdirSync(dirname(dest), { recursive: true });
        writeFileSync(dest, content, "utf-8");
        console.log(`   ✍️  src/lib/components/ui/${name}/${file}`);
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

    if (root) console.log(`\n✅ ${name} installed at src/lib/components/ui/${name}/`);
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
