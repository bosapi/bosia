import { join, dirname } from "path";
import { mkdirSync, writeFileSync } from "fs";
import { spawn } from "bun";
import { addComponent } from "./add.ts";

// ─── bosbun feat <feature> ─────────────────────────────────
// Fetches a feature scaffold from the GitHub registry.
// Installs required components, copies route/lib files, installs npm deps.

const REGISTRY_BASE = "https://raw.githubusercontent.com/bosapi/bosbun/main/registry";

interface FeatureMeta {
    name: string;
    description: string;
    components: string[];              // bosbun components to install via `bosbun add`
    files: string[];                   // source filenames in the registry feature dir
    targets: string[];                 // destination paths relative to project root
    npmDeps: Record<string, string>;
}

export async function runFeat(name: string | undefined) {
    if (!name) {
        console.error("❌ Please provide a feature name.\n   Usage: bosbun feat <feature>");
        process.exit(1);
    }

    console.log(`🐰 Installing feature: ${name}\n`);

    const meta = await fetchJSON<FeatureMeta>(`${REGISTRY_BASE}/features/${name}/meta.json`);

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
        const content = await fetchText(`${REGISTRY_BASE}/features/${name}/${file}`);
        const dest = join(process.cwd(), target);
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

    console.log(`\n✅ Feature "${name}" scaffolded!`);
    if (meta.description) console.log(`   ${meta.description}`);
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
