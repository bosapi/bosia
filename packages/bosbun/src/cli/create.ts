import { resolve, join, basename } from "path";
import { existsSync, mkdirSync, readdirSync, statSync, readFileSync, writeFileSync } from "fs";
import { spawn } from "bun";

// ─── bosbun create <name> ──────────────────────────────────

const TEMPLATE_DIR = resolve(import.meta.dir, "../../templates/default");

export async function runCreate(name: string | undefined) {
    if (!name) {
        console.error("❌ Please provide a project name.\n   Usage: bosbun create my-app");
        process.exit(1);
    }

    const targetDir = resolve(process.cwd(), name);

    if (existsSync(targetDir)) {
        console.error(`❌ Directory already exists: ${targetDir}`);
        process.exit(1);
    }

    console.log(`🐰 Creating Bosbun project: ${basename(targetDir)}\n`);

    copyDir(TEMPLATE_DIR, targetDir, name);

    console.log(`✅ Project created at ${targetDir}\n`);

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
        console.log(`\n🎉 Ready!\n\n  cd ${name}\n  bun x bosbun dev\n`);
    }
}

function copyDir(src: string, dest: string, projectName: string) {
    mkdirSync(dest, { recursive: true });
    for (const entry of readdirSync(src, { withFileTypes: true })) {
        const srcPath = join(src, entry.name);
        const destPath = join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath, projectName);
        } else {
            const content = readFileSync(srcPath, "utf-8").replaceAll("{{PROJECT_NAME}}", projectName);
            writeFileSync(destPath, content, "utf-8");
        }
    }
}
