import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { OUT_DIR } from "./paths.ts";

// ─── Build Artifacts ─────────────────────────────────────
// The one place the runtime reads the JSON the build left in OUT_DIR
// (manifest.json, app-html.json, route-manifest.json). Runtimes without a
// filesystem (Cloudflare Workers) swap this module for `.bosia/artifacts.ts`,
// which holds the same JSON inlined — see artifactCodegen.ts and plugin.ts.

/** Parsed `<dir>/<name>`, or undefined when it is missing or unreadable. */
export function readArtifact<T>(name: string, dir: string = OUT_DIR): T | undefined {
	const p = join(dir, name);
	if (!existsSync(p)) return undefined;
	try {
		return JSON.parse(readFileSync(p, "utf-8")) as T;
	} catch {
		return undefined;
	}
}
