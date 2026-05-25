import type { RequestEvent } from "bosia";
import { join, normalize } from "node:path";

const ROOT = process.env.UPLOAD_DIR ?? "./uploads";

export async function GET({ params }: RequestEvent) {
	const rel = Array.isArray(params.path) ? params.path.join("/") : String(params.path ?? "");

	// Path-traversal guard: normalize and refuse anything escaping ROOT.
	const safe = normalize(rel).replace(/^([./\\]+)/, "");
	if (!safe || safe.includes("..")) {
		return new Response("Not found", { status: 404 });
	}

	const file = Bun.file(join(ROOT, safe));
	if (!(await file.exists())) {
		return new Response("Not found", { status: 404 });
	}

	return new Response(file, {
		headers: {
			"Cache-Control": "public, max-age=31536000, immutable",
		},
	});
}
