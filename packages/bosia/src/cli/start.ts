import { spawn } from "bun";
import { loadEnv } from "../core/env.ts";
import { BOSIA_NODE_PATH, OUT_DIR } from "../core/paths.ts";

export async function runStart() {
	loadEnv("production");

	let serverEntry = "index.js";
	try {
		const manifest = await Bun.file(`${OUT_DIR}/manifest.json`).json();
		serverEntry = manifest.serverEntry ?? "index.js";
	} catch {}

	const proc = spawn(["bun", "run", `${OUT_DIR}/server/${serverEntry}`], {
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
	await proc.exited;
}
