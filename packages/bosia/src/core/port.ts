/** PIDs listening on `port`. Fails open to [] — lsof may be absent. */
export async function pidsOnPort(port: number): Promise<number[]> {
	try {
		const proc = Bun.spawn(["lsof", "-ti", `tcp:${port}`, "-sTCP:LISTEN"], {
			stdout: "pipe",
			stderr: "ignore",
		});
		const out = await new Response(proc.stdout).text();
		await proc.exited;
		return [...new Set(out.split("\n").map((s) => s.trim()))]
			.map(Number)
			.filter((pid) => Number.isInteger(pid) && pid > 0);
	} catch {
		return [];
	}
}
