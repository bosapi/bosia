import { test, expect, afterAll } from "bun:test";
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from "fs";
import { join } from "path";

// Docker, systemd and `kill <pid>` signal `bosia start` alone, not its process
// group. It used to swallow SIGTERM, so the server never drained and Docker
// SIGKILLed it after 10s (exit 137).

const tmpDir = join(import.meta.dir, "..", `.tmp-start-signal-${Date.now()}`);
const cli = join(import.meta.dir, "..", "src", "cli", "index.ts");

afterAll(() => rmSync(tmpDir, { recursive: true, force: true }));

test("bosia start forwards SIGTERM to the server", async () => {
	mkdirSync(join(tmpDir, "dist", "server"), { recursive: true });
	writeFileSync(
		join(tmpDir, "dist", "server", "index.js"),
		`require("fs").writeFileSync("ready", "");
process.on("SIGTERM", () => { require("fs").writeFileSync("got", "SIGTERM"); process.exit(0); });
setTimeout(() => process.exit(1), 10_000); // never outlive a failed run
`,
	);

	const proc = Bun.spawn(["bun", cli, "start"], {
		cwd: tmpDir,
		stdout: "ignore",
		stderr: "inherit",
	});
	for (let i = 0; i < 100 && !existsSync(join(tmpDir, "ready")); i++) await Bun.sleep(50);
	expect(existsSync(join(tmpDir, "ready"))).toBe(true);

	proc.kill("SIGTERM"); // bosia's pid only, not the group
	const code = await Promise.race([proc.exited, Bun.sleep(3000).then(() => "timeout")]);
	if (code === "timeout") proc.kill("SIGKILL");

	expect(code).toBe(0);
	expect(readFileSync(join(tmpDir, "got"), "utf8")).toBe("SIGTERM");
}, 15_000);
