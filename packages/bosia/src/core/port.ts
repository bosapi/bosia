/** PIDs listening on `port`. Fails open to [] — lsof / netstat may be absent. */
export async function pidsOnPort(port: number): Promise<number[]> {
	const isWindows = process.platform === "win32";
	try {
		const cmd = isWindows ? ["netstat", "-ano"] : ["lsof", "-ti", `tcp:${port}`, "-sTCP:LISTEN"];
		const proc = Bun.spawn(cmd, { stdout: "pipe", stderr: "ignore" });
		const out = await new Response(proc.stdout).text();
		await proc.exited;
		return isWindows ? parseNetstat(out, port) : parseLsof(out);
	} catch {
		return [];
	}
}

/** `lsof -t` output: one PID per line. */
export function parseLsof(out: string): number[] {
	return uniquePids(out.split("\n").map((s) => s.trim()));
}

/**
 * `netstat -ano` (Windows) rows: `TCP  0.0.0.0:3000  0.0.0.0:0  LISTENING  1234`.
 * The state column is localized on non-English Windows, so a listener is
 * detected by its foreign address ending in `:0` instead of the word LISTENING.
 */
export function parseNetstat(out: string, port: number): number[] {
	const pids: string[] = [];
	for (const line of out.split(/\r?\n/)) {
		const cols = line.trim().split(/\s+/);
		if (cols.length < 5 || cols[0].toUpperCase() !== "TCP") continue;
		const [, local, foreign] = cols;
		if (local.endsWith(`:${port}`) && foreign.endsWith(":0")) pids.push(cols[cols.length - 1]);
	}
	return uniquePids(pids);
}

function uniquePids(raw: string[]): number[] {
	return [...new Set(raw)].map(Number).filter((pid) => Number.isInteger(pid) && pid > 0);
}
