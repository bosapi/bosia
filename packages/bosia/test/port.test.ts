import { describe, expect, test } from "bun:test";
import { pidsOnPort, parseLsof, parseNetstat } from "../src/core/port.ts";

// pidsOnPort fails open to [] by design, so there is nothing to assert without lsof / netstat.
const hasPortTool = !!Bun.which(process.platform === "win32" ? "netstat" : "lsof");

describe.if(hasPortTool)("pidsOnPort", () => {
	test("finds this process on a port it is listening on", async () => {
		const server = Bun.serve({ port: 0, fetch: () => new Response("ok") });
		try {
			expect(await pidsOnPort(server.port)).toContain(process.pid);
		} finally {
			server.stop(true);
		}
	});

	test("returns [] for a port with no listener", async () => {
		const server = Bun.serve({ port: 0, fetch: () => new Response("ok") });
		const port = server.port;
		server.stop(true);
		expect(await pidsOnPort(port)).toEqual([]);
	});
});

describe("parseLsof()", () => {
	test("dedupes PIDs and drops blanks", () => {
		expect(parseLsof("123\n123\n456\n\n")).toEqual([123, 456]);
	});
});

describe("parseNetstat()", () => {
	const out = [
		"",
		"Active Connections",
		"",
		"  Proto  Local Address          Foreign Address        State           PID",
		"  TCP    0.0.0.0:3000           0.0.0.0:0              LISTENING       1234",
		"  TCP    [::]:3000              [::]:0                 LISTENING       1234",
		"  TCP    127.0.0.1:3000         127.0.0.1:52100        ESTABLISHED     1234",
		"  TCP    127.0.0.1:52100        127.0.0.1:3000         ESTABLISHED     999",
		"  TCP    0.0.0.0:30000          0.0.0.0:0              LISTENING       777",
		"  UDP    0.0.0.0:3000           *:*                                    555",
	].join("\r\n");

	test("returns listeners on the exact port only", () => {
		expect(parseNetstat(out, 3000)).toEqual([1234]);
		expect(parseNetstat(out, 30000)).toEqual([777]);
	});

	test("ignores localized state column", () => {
		const de = "  TCP    0.0.0.0:4000   0.0.0.0:0   ABHÖREN   42";
		expect(parseNetstat(de, 4000)).toEqual([42]);
	});

	test("returns [] when nothing listens", () => {
		expect(parseNetstat(out, 5000)).toEqual([]);
	});
});
