// Cloudflare Workers entry. Same app as server.bun.ts, minus what an isolate
// doesn't have: no port to bind, no signals, no filesystem. User hooks and
// config arrive as static imports (workersCodegen.ts), static files are served
// by Workers Static Assets before the worker runs.

import { CloudflareAdapter } from "elysia/adapter/cloudflare-worker";
import { config, handle } from "bosia:workers-runtime";

import { setBosiaConfig } from "./config.ts";
import type { PlatformEnv } from "./hooks.ts";
import { getPlatform, setPlatform } from "./platform.ts";
import { createApp } from "./server.ts";

setBosiaConfig(config);

const app = (await createApp({ handle, adapter: CloudflareAdapter })).compile();

export default {
	fetch(request: Request, env: PlatformEnv): Response | Promise<Response> {
		// Bindings are one object per isolate — capture on the first request.
		if (!getPlatform()) setPlatform({ env });
		return app.fetch(request);
	},
};
