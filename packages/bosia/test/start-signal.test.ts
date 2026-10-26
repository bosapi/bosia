import { test, expect, afterAll } from "bun:test";
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from "fs";
import { join } from "path";

// Docker, systemd, PM2 and `kill <pid>` signal `bosia start` alone, not its
// process group. It used to swallow the signal, so the server never drained
// and Docker SIGKILLed it after 10s (exit 137).

const root = join(import.meta.dir, "..", `.tmp-start-signal-${Date.now()}`);
const cli = join(import.meta.dir, "..", "src", "cli", "index.ts");

afterAll(() => rmSync(root, { recursive: true, force: true }));

// Windows has no signals to forward: kill() terminates the process outright.
test.skipIf(process.platform === "win32").each(["SIGTERM", "SIGINT"] as const)(
	"bosia start forwards %s to the server",
	async (sig) => {
		const dir = join(root, sig);
		mkdirSync(join(dir, "dist", "server"), { recursive: true });
		writeFileSync(
			join(dir, "dist", "server", "index.js"),
			`for (const s of ["SIGTERM", "SIGINT"]) process.on(s, () => { require("fs").writeFileSync("got", s); process.exit(0); });
require("fs").writeFileSync("ready", "");
setTimeout(() => process.exit(1), 10_000); // never outlive a failed run
`,
		);

		const proc = Bun.spawn(["bun", cli, "start"], {
			cwd: dir,
			env: { ...process.env, BOSIA_OUT_DIR: undefined },
			stdout: "ignore",
			stderr: "inherit",
		});
		for (let i = 0; i < 100 && !existsSync(join(dir, "ready")); i++) await Bun.sleep(50);
		expect(existsSync(join(dir, "ready"))).toBe(true);

		proc.kill(sig); // bosia's pid only, not the group
		const code = await Promise.race([proc.exited, Bun.sleep(3000).then(() => "timeout")]);
		if (code === "timeout") proc.kill("SIGKILL");

		expect(code).toBe(0);
		expect(readFileSync(join(dir, "got"), "utf8")).toBe(sig);
	},
	15_000,
);
