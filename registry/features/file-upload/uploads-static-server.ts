import type { RequestEvent } from "bosia";
import { join, normalize } from "node:path";
import { FileService } from "../../../features/file-upload";

const ROOT = process.env.UPLOAD_DIR ?? "./uploads";

export async function GET({ params, locals }: RequestEvent) {
	if (!locals.user) {
		return new Response("Unauthorized", { status: 401 });
	}

	const rel = Array.isArray(params.path) ? params.path.join("/") : String(params.path ?? "");

	// Path-traversal guard: normalize and refuse anything escaping ROOT.
	const safe = normalize(rel).replace(/^([./\\]+)/, "");
	if (!safe || safe.includes("..")) {
		return new Response("Not found", { status: 404 });
	}

	// Ownership check — file rows carry userId; 404 (not 403) so users can't
	// probe other users' keys.
	const record = await FileService.getByKey(safe);
	if (!record || record.userId !== locals.user.id) {
		return new Response("Not found", { status: 404 });
	}

	const file = Bun.file(join(ROOT, safe));
	if (!(await file.exists())) {
		return new Response("Not found", { status: 404 });
	}

	return new Response(file, {
		headers: {
			"Content-Type": record.mime,
			"Cache-Control": "private, no-store",
		},
	});
}
