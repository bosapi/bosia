import { spawn } from "bun";
import { resolve } from "path";

export async function runDev() {
	const devScript = resolve(import.meta.dir, "../core/dev.ts");
	const proc = spawn(["bun", "run", devScript], {
		stdout: "inherit",
		stderr: "inherit",
		cwd: process.cwd(),
	});
	// Survive ^C so we keep waiting for the child instead of orphaning it
	// mid-shutdown. The terminal delivers SIGINT to the whole process group,
	// so the child already gets the signal — no forwarding needed.
	for (const sig of ["SIGINT", "SIGTERM"] as const) process.on(sig, () => {});
	await proc.exited;
}
