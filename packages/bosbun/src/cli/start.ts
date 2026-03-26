import { spawn } from "bun";
import { loadEnv } from "../core/env.ts";
import { BOSIA_NODE_PATH } from "../core/paths.ts";

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
            NODE_PATH: BOSIA_NODE_PATH,
        },
    });

    await proc.exited;
}
