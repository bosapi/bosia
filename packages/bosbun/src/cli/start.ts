import { spawn } from "bun";
import { join } from "path";
import { loadEnv } from "../core/env.ts";

const BOSBUN_NODE_MODULES = join(import.meta.dir, "..", "..", "node_modules");

export async function runStart() {
    loadEnv("production");

    let serverEntry = "index.js";
    try {
        const manifest = await Bun.file("./dist/manifest.json").json();
        serverEntry = manifest.serverEntry ?? "index.js";
    } catch { }

    const proc = spawn(["bun", "run", `dist/server/${serverEntry}`], {
        stdout: "inherit",
        stderr: "inherit",
        cwd: process.cwd(),
        env: {
            ...process.env,
            NODE_ENV: "production",
            NODE_PATH: BOSBUN_NODE_MODULES,
        },
    });

    await proc.exited;
}
