import { resolve, join, basename, relative } from "path";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { spawn } from "bun";
import * as p from "@clack/prompts";
import { installFeature, initFeatRegistry, resolveLocalRegistry } from "./feat.ts";
import { initAddRegistry } from "./add.ts";

// ─── bosia create <name> [--template <name>] ──────────────

const TEMPLATES_DIR = resolve(import.meta.dir, "../../templates");
const BOSIA_PKG = JSON.parse(readFileSync(resolve(import.meta.dir, "../../package.json"), "utf-8"));
const BOSIA_VERSION: string = BOSIA_PKG.version;

const TEMPLATE_DESCRIPTIONS: Record<string, string> = {
    default: "Minimal starter with routing and Tailwind",
    demo: "Full-featured demo with hooks, API routes, form actions, and more",
    drizzle: "PostgreSQL + Drizzle ORM with full CRUD todo demo",
};

export async function runCreate(name: string | undefined, args: string[] = []) {
    if (!name) {
        console.error("❌ Please provide a project name.\n   Usage: bosia create my-app");
        process.exit(1);
    }

    const targetDir = resolve(process.cwd(), name);

    if (existsSync(targetDir)) {
        console.error(`❌ Directory already exists: ${targetDir}`);
        process.exit(1);
    }

    // Parse --template flag
    let template: string | undefined;
    const templateIdx = args.indexOf("--template");
    if (templateIdx !== -1 && args[templateIdx + 1]) {
        template = args[templateIdx + 1];
    }

    // Parse --local flag
    const isLocal = args.includes("--local");

    // If no --template flag, prompt interactively
    if (!template) {
        template = await promptTemplate();
    }

    // Validate template exists
    const templateDir = resolve(TEMPLATES_DIR, template);
    if (!existsSync(templateDir)) {
        const available = getAvailableTemplates().join(", ");
        console.error(`❌ Unknown template: "${template}"\n   Available: ${available}`);
        process.exit(1);
    }

    console.log(`\n⬡ Creating Bosia project: ${basename(targetDir)} (template: ${template})\n`);

    copyDir(templateDir, targetDir, name, isLocal);

    if (existsSync(join(targetDir, ".env.example"))) {
        writeFileSync(join(targetDir, ".env"), readFileSync(join(targetDir, ".env.example"), "utf-8"));
    }

    // Install template features from registry
    const templateConfigPath = join(templateDir, "template.json");
    if (existsSync(templateConfigPath)) {
        const config = JSON.parse(readFileSync(templateConfigPath, "utf-8"));
        if (config.features?.length) {
            let localRegistry: string | null = null;
            try {
                localRegistry = resolveLocalRegistry();
            } catch {
                // Local registry not found — will use remote
            }

            await initAddRegistry(localRegistry);
            initFeatRegistry(localRegistry);

            for (const feat of config.features) {
                await installFeature(feat, true, {
                    skipInstall: true,
                    skipPrompts: true,
                    cwd: targetDir,
                });
            }
        }
    }

    console.log(`\n✅ Project created at ${targetDir}\n`);

    console.log("Installing dependencies...");
    const proc = spawn(["bun", "install"], {
        stdout: "inherit",
        stderr: "inherit",
        cwd: targetDir,
    });
    const exitCode = await proc.exited;
    if (exitCode !== 0) {
        console.warn("⚠️  bun install failed — run it manually.");
    } else {
        console.log(`\n🎉 Ready!\n\ncd ${name}`);

        const instPath = join(templateDir, "instructions.txt");
        if (existsSync(instPath)) {
            const instructions = readFileSync(instPath, "utf-8").trimEnd();
            if (instructions) console.log(instructions);
        }

        console.log(`bun x bosia dev\n`);
    }
}

function getAvailableTemplates(): string[] {
    return readdirSync(TEMPLATES_DIR, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
        .sort((a, b) => (a === "default" ? -1 : b === "default" ? 1 : a.localeCompare(b)));
}

async function promptTemplate(): Promise<string> {
    const templates = getAvailableTemplates();

    if (templates.length === 1) return templates[0];

    const selected = await p.select({
        message: "Which template?",
        options: templates.map((t) => ({
            value: t,
            label: t,
            hint: TEMPLATE_DESCRIPTIONS[t],
        })),
    });

    if (p.isCancel(selected)) {
        p.cancel("Operation cancelled.");
        process.exit(0);
    }

    return selected as string;
}

function copyDir(src: string, dest: string, projectName: string, isLocal: boolean) {
    mkdirSync(dest, { recursive: true });
    for (const entry of readdirSync(src, { withFileTypes: true })) {
        const srcPath = join(src, entry.name);
        const destPath = join(dest, entry.name);

        // Do not copy instructions.txt or template.json to the final project
        if (entry.name === "instructions.txt" || entry.name === "template.json") continue;

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath, projectName, isLocal);
        } else {
            let content = readFileSync(srcPath, "utf-8")
                .replaceAll("{{PROJECT_NAME}}", projectName);

            if (entry.name === "package.json" && isLocal) {
                const bosiaPath = resolve(import.meta.dir, "../../");
                const relPath = relative(dest, bosiaPath);
                content = content.replaceAll("\"^{{BOSIA_VERSION}}\"", `"file:${relPath}"`);
            } else {
                content = content.replaceAll("{{BOSIA_VERSION}}", BOSIA_VERSION);
            }

            writeFileSync(destPath, content, "utf-8");
        }
    }
}
