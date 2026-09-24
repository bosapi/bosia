import { spawn } from "bun";
import { resolve } from "path";
import { loadEnv } from "../core/env.ts";

export async function runBuild(args: string[] = []) {
	loadEnv("production");
	// --target=workers or --target workers; overrides bosia.config's `target`.
	const eq = args.find((a) => a.startsWith("--target="));
	const i = args.indexOf("--target");
	const target = eq ? eq.slice("--target=".length) : i !== -1 ? args[i + 1] : undefined;
	if (target) process.env.BOSIA_TARGET = target;
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
