import { describe, expect, test } from "bun:test";
import { pidsOnPort } from "../src/core/port.ts";

// pidsOnPort fails open to [] by design, so there is nothing to assert without lsof.
const hasLsof = !!Bun.which("lsof");

describe.if(hasLsof)("pidsOnPort", () => {
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
