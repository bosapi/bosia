import { spawn } from "bun";
import { loadEnv } from "../core/env.ts";
import { BOSIA_NODE_PATH, OUT_DIR } from "../core/paths.ts";

export async function runStart() {
	loadEnv("production");

	let serverEntry = "index.js";
	let target = "bun";
	try {
		const manifest = await Bun.file(`${OUT_DIR}/manifest.json`).json();
		serverEntry = manifest.serverEntry ?? "index.js";
		target = manifest.target ?? "bun";
	} catch {}

	// A Workers build runs in workerd, locally via wrangler (fetched on first use).
	const cmd =
		target === "workers"
			? ["bunx", "wrangler", "dev", ...(process.env.PORT ? ["--port", process.env.PORT] : [])]
			: ["bun", "run", `${OUT_DIR}/server/${serverEntry}`];

	const proc = spawn(cmd, {
		stdout: "inherit",
		stderr: "inherit",
		cwd: process.cwd(),
		env: {
			...process.env,
			NODE_ENV: "production",
			NODE_PATH: BOSIA_NODE_PATH,
		},
	});

	// Survive the signal so we keep waiting for the child instead of orphaning
	// it mid-drain, and pass it on: Docker and `kill <pid>` signal only this
	// process. A terminal ^C (or systemd/PM2 signalling the whole group) reaches
	// the child too; the Bun server ignores every signal after its first. wrangler
	// doesn't, so it gets ^C from the terminal alone. Windows: kill() is
	// TerminateProcess (no drain) and the console already sends Ctrl+C on.
	for (const sig of ["SIGINT", "SIGTERM"] as const)
		process.on(sig, () => {
			if (process.platform === "win32" || (sig === "SIGINT" && target === "workers")) return;
			proc.kill(sig);
		});
	// Propagate the child's code — a refused boot must not report success to CI,
	// Docker restart policies or orchestrators.
	process.exit(await proc.exited);
}
