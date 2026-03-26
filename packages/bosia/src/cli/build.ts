import { spawn } from "bun";
import { resolve } from "path";
import { loadEnv } from "../core/env.ts";

export async function runBuild() {
    loadEnv("production");
    const buildScript = resolve(import.meta.dir, "../core/build.ts");
    const proc = spawn(["bun", "run", buildScript], {
        stdout: "inherit",
        stderr: "inherit",
        cwd: process.cwd(),
        env: { ...process.env, NODE_ENV: process.env.NODE_ENV ?? "production" },
    });
    const exitCode = await proc.exited;
    if (exitCode !== 0) process.exit(exitCode ?? 1);
}
