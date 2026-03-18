import { spawn } from "bun";
import { resolve } from "path";

export async function runDev() {
    const devScript = resolve(import.meta.dir, "../core/dev.ts");
    const proc = spawn(["bun", "run", devScript], {
        stdout: "inherit",
        stderr: "inherit",
        cwd: process.cwd(),
    });
    await proc.exited;
}
