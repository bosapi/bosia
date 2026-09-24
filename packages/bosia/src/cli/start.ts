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

	// Survive ^C so we keep waiting for the child instead of orphaning it
	// mid-drain. The terminal delivers SIGINT to the whole process group,
	// so the child already gets the signal — no forwarding needed.
	for (const sig of ["SIGINT", "SIGTERM"] as const) process.on(sig, () => {});
	// Propagate the child's code — a refused boot must not report success to CI,
	// Docker restart policies or orchestrators.
	process.exit(await proc.exited);
}
