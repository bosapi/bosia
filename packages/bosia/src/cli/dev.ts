import { spawn } from "bun";
import { resolve } from "path";

export async function runDev() {
	const devScript = resolve(import.meta.dir, "../core/dev.ts");
	const proc = spawn(["bun", "run", devScript], {
		stdout: "inherit",
		stderr: "inherit",
		cwd: process.cwd(),
	});
	// Survive the signal so we keep waiting for the child instead of orphaning
	// it mid-shutdown, and pass it on: Docker and `kill <pid>` signal only this
	// process. A terminal ^C (or systemd/PM2 signalling the whole group) reaches
	// the child too; it ignores every signal after its first. Windows: kill() is
	// TerminateProcess, which skips the child's cleanup, and the console already
	// sends Ctrl+C on.
	for (const sig of ["SIGINT", "SIGTERM"] as const)
		process.on(sig, () => process.platform !== "win32" && proc.kill(sig));
	process.exit(await proc.exited);
}
